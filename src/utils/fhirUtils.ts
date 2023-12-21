import { FhirResource, Reference, ResearchStudy } from 'fhir/r4';

/**
 * Does a search through the contained resources to find a given resource by ID.
 * @param study the study to find the contained resource in
 * @param resourceType the resource type to locate
 * @param id the ID of the resource to find
 * @returns the contained resource with that ID (technically only the first one
 * located) or undefined if none is ever found
 */
export const findContainedResourceById = <T extends FhirResource>(
  study: ResearchStudy,
  resourceType: T['resourceType'],
  id: string
): T | undefined => {
  // There can be no contained resources
  if (!Array.isArray(study.contained)) {
    return undefined;
  }
  return study.contained.find<T>((value): value is T => value.resourceType === resourceType && value.id === id);
};

/**
 * Helper function to determine if a reference is a relative reference, and then
 * return the associated contained resource if it is
 * @param study the study to locate the resource in
 * @param resourceType the type of resource to limit the search to
 * @param reference the reference to check
 * @returns the discovered resource or undefined if the reference isn't relative
 * or isn't found
 */
export const findContainedResourceByReference = <T extends FhirResource>(
  study: ResearchStudy,
  resourceType: T['resourceType'],
  reference: Reference | string | undefined
): T | undefined => {
  // Get just the reference URL
  const ref = typeof reference === 'string' ? reference : reference?.reference;
  // If it's relative, return it
  return ref?.startsWith('#') ? findContainedResourceById(study, resourceType, ref.substring(1)) : undefined;
};
