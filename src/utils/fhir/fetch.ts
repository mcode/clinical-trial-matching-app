import { Bundle, BundleEntry, FhirResource, Medication, MedicationRequest } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

/**
 * Attempts to request all pages of a given resource type. Each page will be
 * returned as a separate Bundle.
 * @param fhirClient the FHIR client
 * @param resourceType the resource type to fetch
 * @returns an array of bundles
 */
export const fetchBundles = async <T extends FhirResource>(
  fhirClient: Client,
  resourceType: T['resourceType']
): Promise<Bundle[]> => {
  return await fhirClient.request<Bundle[]>(`${resourceType}?patient=${fhirClient.getPatientId()}`, { pageLimit: 0 });
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
  resourceType: T['resourceType']
): Promise<BundleEntry<T>[]> => {
  const result: BundleEntry<T>[] = [];
  const bundles = await fetchBundles(fhirClient, resourceType);
  for (const bundle of bundles) {
    // If the bundle exists, return a filtered copy of just the entries array
    if (bundle && bundle.entry) {
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
  resourceType: T['resourceType']
): Promise<T[]> => (await fetchBundleEntries(fhirClient, resourceType)).map<T>(entry => entry.resource);

/**
 * Retrieves all known medications from the current patient.
 * @param fhirClient the client to retrieve medications from
 */
export const fetchMedications = async (fhirClient: Client): Promise<Medication[]> => {
  const medications: Promise<Medication>[] = [];
  for (const medRequest of await fetchResources<MedicationRequest>(fhirClient, 'MedicationRequest')) {
    console.log('Checking medication request');
    console.log(JSON.stringify(medRequest, null, 2));
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
