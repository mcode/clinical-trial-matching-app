import type { Bundle, BundleEntry, FhirResource } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

export async function fetchBundle<T extends FhirResource>(fhirClient: Client, resourceType: T['resourceType']): Promise<Bundle> {
  return await fhirClient.request<Bundle>(`${resourceType}?patient=${fhirClient.getPatientId()}`);
}

/**
 * This method fetches a given bundle containing resources of the given type and then returns only the bundle entries
 * that match that resource type.
 * @param fhirClient the FHIR client
 * @param resourceType
 * @returns
 */
export async function fetchBundleEntries<T extends FhirResource>(fhirClient: Client, resourceType: T['resourceType']): Promise<BundleEntry<T>[]> {
  const bundle = await fetchBundle(fhirClient, resourceType);
  // If the bundle exists, return a filtered copy of just the entries array
  if (bundle && bundle.entry) {
    return bundle.entry.filter<BundleEntry<T>>((entry): entry is BundleEntry<T> => entry.resource?.resourceType === resourceType);
  }
  // Default: return an empty array
  return [];
}

/**
 * Determines if a given resource has a profile. This can be used in the Array filter method to filter out resources
 * that match a given profile.
 * @param resource the resource to check
 * @param profile the profile to find
 * @returns true if the resource has the profile, false otherwise
 */
export const resourceHasProfile = (resource: FhirResource, profile: string): boolean => {
  return (resource.meta?.profile?.indexOf(profile) ?? -1) >= 0;
}
