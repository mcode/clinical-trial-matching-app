/**
 * This module is used to filter FHIR records.
 */

import { Bundle, BundleEntry, CodeableConcept, Condition, Observation, Resource } from 'types/fhir-types';
import { MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR, MCODE_PRIMARY_CANCER_CONDITION, SNOMED_CODE_URI } from './fhirConstants';
import { NamedSNOMEDCode, Patient } from './fhirConversionUtils';

export const addResource = (bundle: Bundle, resource: Resource): void => {
  const entry: BundleEntry = {
    resource: resource,
  };
  if (bundle.entry) {
    bundle.entry.push(entry);
  } else {
    bundle.entry = [entry];
  }
};

export const addCancerType = (bundle: Bundle, code: NamedSNOMEDCode): Condition => {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking
  const resource: Condition = {
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
  addResource(bundle, resource);
  return resource;
};

function findCondition(bundleOrCondition: Bundle | Condition, profile: string): Condition | null {
  if (bundleOrCondition.resourceType === 'Condition') {
    return bundleOrCondition as Condition;
  }
  const entries = (bundleOrCondition as Bundle).entry;
  if (entries) {
    const conditionEntry = entries.find((entry): boolean => {
      if (entry.resource.resourceType === 'Condition') {
        // Check to see if it matches the profile
        if (entry.resource.meta?.profile?.indexOf(profile) >= 0) {
          return true;
        }
      }
      return false;
    });
    if (conditionEntry) {
      return conditionEntry.resource as Condition;
    }
  }
  return null;
}

/**
 * Adds a histology morphology extension to an existing bundle.
 * @param bundleOrCondition the bundle containing a primary cancer condition or the condition itself
 * @param code the code to add
 * @returns the existing Condition the extension was added to or the newly created Condition
 */
export const addCancerHistologyMorphology = (
  bundleOrCondition: Bundle | Condition,
  code: NamedSNOMEDCode
): Condition => {
  // Find the actual condition
  let condition = findCondition(bundleOrCondition, MCODE_PRIMARY_CANCER_CONDITION);
  // If we didn't find a condition, we need to create one
  if (!condition) {
    condition = {
      resourceType: 'Condition',
    };
  }
  const histology = {
    url: MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR,
    valueCodeableConcept: {
      code: code.code,
      display: code.display,
    },
  };
  if (condition.extension) {
    condition.extension.push(histology);
  } else {
    condition.extension = [histology];
  }
  return condition;
};

export function convertStringToObservation({
  bundle,
  valueString,
  id,
  profile_value,
  codingSystem,
  codingSystemCode,
}: {
  bundle: Bundle;
  valueString: string | string[];
  id: string;
  profile_value: string;
  codingSystem: string;
  codingSystemCode: string;
}): Observation {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking
  let code: CodeableConcept = null;
  if (codingSystemCode) {
    code = {
      coding: [
        {
          system: codingSystem,
          code: codingSystemCode,
        },
      ],
    };
  }
  let retResource: Observation = null;
  if (code) {
    const resource: Observation = {
      resourceType: 'Observation',
      id: id,
      meta: {
        profile: [profile_value],
      },
      code,
      valueString,
    };
    retResource = resource;
  } else {
    const resource: Observation = {
      resourceType: 'Observation',
      id: id,
      meta: {
        profile: [profile_value],
      },
      valueString,
    };
    retResource = resource;
  }
  return retResource;
}
export function convertNamedSNOMEDCodetoObservation({
  bundle,
  codedValue,
  id,
  profile_value,
  codingSystem,
  codingSystemCode,
}: {
  bundle: Bundle;
  codedValue: NamedSNOMEDCode;
  id: string;
  profile_value: string;
  codingSystem: string;
  codingSystemCode: string;
}): Observation {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking

  const tmpCode: string | number = codedValue.code.toString();
  const tmpDisplay = codedValue.display;

  const resource: Observation = {
    resourceType: 'Observation',
    status: 'completed',
    medicationCodeableConcept: {
      coding: [
        {
          system: codingSystem,
          code: tmpCode,
          display: tmpDisplay,
        },
      ],
    },
    meta: {
      profile: [profile_value],
    },
    subject: undefined,
  };

  return resource;
}

export function convertNamedSNOMEDCodeToMedicationStatement({
  bundle,
  codedValue,
  id,
  profile_value,
  codingSystem,
  codingSystemCode,
}: {
  bundle: Bundle;
  codedValue: NamedSNOMEDCode;
  id: string;
  profile_value: string;
  codingSystem: string;
  codingSystemCode: string;
}): MedicationStatement {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking

  const tmpCode: string | number = codedValue.code.toString();
  const tmpDisplay = codedValue.display;
  const search_patient: Patient = {
    id: '0',
    gender: 'other',
    name: 'search_name',
    age: '0',
    zipcode: '00000',
  };
  const resource: MedicationStatement = {
    resourceType: 'MedicationStatement',
    subject: search_patient,
    status: 'completed',
    medicationCodeableConcept: {
      coding: [
        {
          system: codingSystem,
          code: tmpCode,
          display: tmpDisplay,
        },
      ],
    },
    meta: {
      profile: [profile_value],
    },
  };

  return resource;
}
