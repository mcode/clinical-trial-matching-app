import { Bundle, BundleEntry, FhirResource, Medication, MedicationRequest, Observation } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

/**
 * Create request parameters based on the current environment.
 * @param resourceType the resource type to use
 * @param env the environment to use, otherwise uses process.env
 * @returns a set of parameters that can be passed to fetchResources
 */
export const createQueryConfig = (
  resourceType: FhirResource['resourceType'],
  env: Record<string, string> = process.env
): Record<string, string> | undefined => {
  const value = env[`FHIR_QUERY_${resourceType.toUpperCase()}`];
  if (value) {
    return Object.fromEntries(new URLSearchParams(value).entries());
  }
  // Otherwise, nothing set for this, so return undefined
  return undefined;
};

/**
 * Attempts to request all pages of a given resource type. Each page will be
 * returned as a separate Bundle.
 * @param fhirClient the FHIR client
 * @param resourceType the resource type to fetch
 * @returns an array of bundles
 */
export const fetchBundles = async <T extends FhirResource>(
  fhirClient: Client,
  resourceType: T['resourceType'],
  parameters?: Record<string, string>
): Promise<Bundle[]> => {
  const extra = parameters
    ? '&' +
      Object.entries(parameters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
    : '';
  return await fhirClient.request<Bundle[]>(`${resourceType}?patient=${fhirClient.getPatientId()}${extra}`, {
    pageLimit: 0,
  });
};

/**
 * This method fetches a given bundle containing resources of the given type and then returns only the bundle entries
 * that match that resource type.
 * @param fhirClient the FHIR client
 * @param resourceType
 * @returns
 */
export const fetchBundleEntries = async <T extends FhirResource>(
  fhirClient: Client,
  resourceType: T['resourceType'],
  parameters?: Record<string, string>
): Promise<BundleEntry<T>[]> => {
  const result: BundleEntry<T>[] = [];
  const bundles = await fetchBundles(fhirClient, resourceType, parameters);
  for (const bundle of bundles) {
    // If the bundle exists, return a filtered copy of just the entries array
    if (bundle?.entry) {
      result.push(
        ...bundle.entry.filter<BundleEntry<T>>(
          (entry): entry is BundleEntry<T> => entry.resource?.resourceType === resourceType
        )
      );
    }
  }
  return result;
};

/**
 * Fetches all resources of the given type from the FHIR client. This discards the bundle entry objects returned from
 * fetchBundleEntries<T>().
 * @param fhirClient the FHIR client
 * @param resourceType the resource type to fetch
 * @returns all resources of the given type
 */
export const fetchResources = async <T extends FhirResource>(
  fhirClient: Client,
  resourceType: T['resourceType'],
  parameters?: Record<string, string>
): Promise<T[]> => (await fetchBundleEntries(fhirClient, resourceType, parameters)).map<T>(entry => entry.resource);

/**
 * Retrieves all known medications from the current patient.
 * @param fhirClient the client to retrieve medications from
 */
export const fetchMedications = async (
  fhirClient: Client,
  parameters?: Record<string, string>
): Promise<Medication[]> => {
  const medications: Promise<Medication>[] = [];
  for (const medRequest of await fetchResources<MedicationRequest>(fhirClient, 'MedicationRequest', parameters)) {
    // See if this requires the medication be loaded separately
    if (medRequest.medicationReference?.reference) {
      // It does, so add the request
      medications.push(fhirClient.request<Medication>(medRequest.medicationReference.reference));
    } else if (medRequest.medicationCodeableConcept) {
      // Has the medication embedded
      medications.push(
        Promise.resolve({
          resourceType: 'Medication',
          code: medRequest.medicationCodeableConcept,
        })
      );
    }
  }
  return Promise.all(medications);
};

/**
 * Determines if a given resource has a profile. This can be used in the Array filter method to filter out resources
 * that match a given profile.
 * @param resource the resource to check
 * @param profile the profile to find
 * @returns true if the resource has the profile, false otherwise
 */
export const resourceHasProfile = (resource: FhirResource, profile: string): boolean => {
  return (resource.meta?.profile?.indexOf(profile) ?? -1) >= 0;
};

/**
 * Determines if any code on the given observation matches the given code.
 * @param observation the observation to check
 * @param system the system to find
 * @param code the code to find
 * @returns true if the observation's code matches
 */
export const observationHasCode = (observation: Observation, system: string, code: string): boolean => {
  // Basically, see if any of the codings in the observation match
  return observation.code?.coding?.findIndex(coding => coding.system === system && coding.code === code) >= 0 ?? false;
};

// TypeScript helper to ensure that the given field is a DateTime field - as nearly as we can determine via FHIR types,
// at least.
type DateField<F extends string | number | symbol> = {
  [key in F]?: string;
};

/**
 * Sorts a set of resources by date, with newest sorted first. This sorts in
 * place, returning the sorted resources.
 * (This may eventually be updated to allow multiple fields to be used along
 * with things like periods. But for now...)
 * @param resources the resources to sort
 * @param dateField the field which contains a date
 * @returns
 */
export const sortByDate = <T extends DateField<F>, F extends keyof T>(resources: T[], dateField: F): T[] => {
  return resources.sort((a, b) => compareDates(a[dateField], b[dateField]));
};

/**
 * Compares two dates, ordering later dates "first" (so 2024-01-02 compares as "less" than 2024-01-01).
 *
 * Note: this currently does not attempt to parse the dates, it uses a simple string comparison. This is valid except
 * when there are differing timezones.
 *
 * @param dateA date A
 * @param dateB date B
 */
export const compareDates = (dateA: string | undefined, dateB: string | undefined): number => {
  const timestampA = parseFHIRDate(dateA),
    timestampB = parseFHIRDate(dateB);
  if (timestampA === undefined) {
    return timestampB === undefined ? 0 : 1;
  }
  if (timestampB === undefined) {
    // timestampA is known to be defined at this point in time
    return -1;
  }
  if (timestampA < timestampB) {
    return 1;
  } else if (timestampA > timestampB) {
    return -1;
  } else {
    return 0;
  }
};

/**
 *
 * @param date the date to parse
 * @returns either the result of Date.parse or undefined if the date was invalid
 */
export const parseFHIRDate = (date: string | undefined): number | undefined => {
  // Regexp is a simplified version of the one in the FHIR spec that does't attempt to enforce ranges (Date.parse should
  // do that - probably, depending on browser)
  // (The regexp is to filter out a bunch of random junk that's otherwise accepted, like '8' meaning
  // '2001-08-01T00:00:00.0Z' in Node.js and Chrome and other random edge cases that are browser specific.)
  if (date && /^\d{4,}(?:-\d{2}(?:-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?)?)?$/.test(date)) {
    console.log('parse', date);
    const result = Date.parse(date);
    // Date.parse can return NaN if the date is invalid. Return undefined
    // instead, it arguably makes more sense.
    return isNaN(result) ? undefined : result;
  }
  return undefined;
};
