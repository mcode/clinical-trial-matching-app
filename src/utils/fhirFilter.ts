/**
 * This module is used to filter FHIR records.
 */

import type { Bundle, BundleEntry, Condition, FhirResource, Observation } from 'fhir/r4';
import { Extension, MedicationStatement, Reference } from 'fhir/r4';
import { MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR, MCODE_PRIMARY_CANCER_CONDITION, SNOMED_CODE_URI } from './fhirConstants';
import { CodedValueType as CodedValueType } from './fhirConversionUtils';

export const addResource = (bundle: Bundle, resource: FhirResource): void => {
  const entry: BundleEntry = {
    resource: resource,
  };
  if (bundle.entry) {
    bundle.entry.push(entry);
  } else {
    bundle.entry = [entry];
  }
};

export const addCancerType = (bundle: Bundle, subject: Reference, code: CodedValueType): Condition => {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking
  const resource: Condition = {
    resourceType: 'Condition',
    meta: {
      profile: [MCODE_PRIMARY_CANCER_CONDITION],
    },
    subject: subject,
    code: {
      coding: [
        {
          system: SNOMED_CODE_URI,
          code: code.code.toString(),
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
 * @param subject the patient this references
 * @param code the code to add
 * @returns the existing Condition the extension was added to or the newly created Condition
 */
export const addCancerHistologyMorphology = (
  bundleOrCondition: Bundle | Condition,
  subject: Reference,
  code: CodedValueType
): Condition => {
  // Find the actual condition
  let condition = findCondition(bundleOrCondition, MCODE_PRIMARY_CANCER_CONDITION);
  // If we didn't find a condition, we need to create one
  if (!condition) {
    condition = {
      resourceType: 'Condition',
      subject: subject,
    };
  }
  const histology: Extension = {
    url: MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR,
    valueCodeableConcept: {
      coding: [{ code: code.code.toString(), display: code.display }],
      text: code.display,
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
  valueString,
  id,
  profile_value,
  codingSystem,
  codingSystemCode,
  subject,
}: {
  valueString: string;
  id: string;
  profile_value: string;
  codingSystem: string;
  codingSystemCode: string;
  subject?: Reference;
}): Observation {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking
  const resource: Observation = {
    resourceType: 'Observation',
    id: id,
    status: 'final',
    meta: {
      profile: [profile_value],
    },
    code: {
      coding: [
        {
          system: codingSystem,
          code: codingSystemCode,
        },
      ],
    },
    valueString,
  };
  if (subject) {
    resource.subject = subject;
  }
  return resource;
}
export function convertCodedValueToObervation({
  codedValue,
  id,
  profile_value,
  codingSystem,
  subject,
}: {
  codedValue: CodedValueType;
  id: string;
  profile_value: string;
  codingSystem: string;
  subject: Reference;
}): Observation {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking

  const tmpCode: string | number = codedValue.code.toString();
  const tmpDisplay = codedValue.display;

  const resource: Observation = {
    resourceType: 'Observation',
    id: id,
    status: 'final',
    subject: subject,
    code: {
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

export function convertCodedValueToMedicationStatement({
  codedValue,
  id,
  profile_value,
  codingSystem,
  subject,
}: {
  codedValue: CodedValueType;
  id: string;
  profile_value: string;
  codingSystem: string;
  subject: Reference;
}): MedicationStatement {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking

  const tmpCode: string | number = codedValue.code.toString();
  const tmpDisplay = codedValue.display;

  const resource: MedicationStatement = {
    resourceType: 'MedicationStatement',
    id: id,
    subject: subject,
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
