import { fhirclient } from 'fhirclient/lib/types';
import { CancerCode } from './cancerTypes';
import { CodeableConcept, Coding } from './fhirTypes';
import { SNOMED_CODE_URI } from './snomed';

export type PrimaryCancerCondition = {
  cancerType: CancerCode;
  cancerSubtype: string;
  stage: string;
};

const getCancerType = (resource: fhirclient.FHIR.Resource): CancerCode | null => {
  if (!resource || resource.resourceType !== 'Condition') {
    return null;
  }
  // Grab the text from the coding for this
  const code = resource.code as CodeableConcept;
  if (code.coding && code.coding.length > 0) {
    let coding: Coding | null = null;
    for (const c of code.coding) {
      if (c.system === SNOMED_CODE_URI) {
        if (coding?.system !== SNOMED_CODE_URI) {
          // Prefer SNOMED over anything else
          coding = c;
        }
      } else if (!coding && c.display) {
        // Use anything with a display value if we have one
        coding = c;
      }
    }
    if (coding) {
      return {
        display: coding.display ?? coding.code,
        fromPatient: true,
      };
    }
  }
  return null;
};

const getCancerSubtype = (resource: fhirclient.FHIR.Resource): string => {
  return (
    (resource && resource.code && resource.code.coding && resource.code.coding[0] && resource.code.coding[0].display) ||
    null
  );
};

const getStage = (resource: fhirclient.FHIR.Resource): string => {
  return (
    (resource &&
      resource.stage &&
      resource.stage[0] &&
      resource.stage[0].summary &&
      resource.stage[0].summary.coding &&
      resource.stage[0].summary.coding[0] &&
      resource.stage[0].summary.coding[0].display) ||
    null
  );
};

export const convertFhirSecondaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): string => {
  const resource = bundle && bundle.entry && bundle.entry[0] && bundle.entry[0].resource;
  return getCancerSubtype(resource);
};

export const convertFhirPrimaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): PrimaryCancerCondition => {
  // Conceptually there can be multiple results for this. For now, just use the first.
  const resource = bundle && bundle.entry && bundle.entry[0] && bundle.entry[0].resource;
  return {
    cancerType: getCancerType(resource),
    cancerSubtype: getCancerSubtype(resource),
    stage: getStage(resource),
  };
};
