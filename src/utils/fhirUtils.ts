import { FhirResource, ResearchStudy } from 'fhir/r4';

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
