/**
 * This module is used to filter FHIR records.
 */

import { Bundle, BundleEntry, Resource } from 'types/fhir-types';
import { NamedSNOMEDCode } from './fhirConversionUtils';
import { MCODE_PRIMARY_CANCER_CONDITION, SNOMED_CODE_URI } from './fhirConstants';

/**
 * Filters a bundle in-place, removing entries
 * @param bundle the bundle to filter
 */
export const filterBundle = (bundle: Bundle, filterFunction: (resource: Resource) => boolean): void => {
  if (bundle.entry) {
    bundle.entry = bundle.entry.filter((entry: BundleEntry): boolean => {
      if (entry.resource) {
        return filterFunction(entry.resource);
      } else {
        // Keep entries without resources for now
        return true;
      }
    });
  }
};

export const removeResourcesByProfile = (bundle: Bundle, resourceType: string, profile: string): void => {
  filterBundle(bundle, (resource: Resource): boolean => {
    if (resource.resourceType !== resourceType) {
      // Do not filter resources that are not the associated type
      return true;
    }
    // Return true (keep) if there is no matching profile.
    return resource.meta?.profile && resource.meta.profile.indexOf(profile) < 0;
  });
};

export const setCancerType = (bundle: Bundle, code: NamedSNOMEDCode): Resource => {
  // First, remove all existing cancer types
  removeResourcesByProfile(bundle, 'Condition', MCODE_PRIMARY_CANCER_CONDITION);
  // Then add in a new resource for that condition
  const resource: Resource = {
    resourceType: 'Condition',
    meta: {
      profile: [MCODE_PRIMARY_CANCER_CONDITION],
    },
    code: {
      coding: [
        {
          system: SNOMED_CODE_URI,
          code: code.code,
          display: code.display,
        },
      ],
    },
  };
  const entry: BundleEntry = {
    resource: resource,
  };
  if (bundle.entry) {
    bundle.entry.push(entry);
  } else {
    bundle.entry = [entry];
  }
  return resource;
};
