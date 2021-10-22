import { fhirclient } from 'fhirclient/lib/types';
import { CancerCode } from './cancerTypes';

export interface CancerType extends CancerCode {
  original?: boolean;
}

export type PrimaryCancerCondition = {
  cancerType: CancerType;
  cancerSubtype: string;
  stage: string;
};

const getCancerType = (resource: fhirclient.FHIR.Resource): CancerType => {
  const coding = resource?.bodySite?.length > 0 ? resource.bodySite[0]?.coding : null;
  if (coding && coding.length > 0 && coding[0].display) {
    return {
      display: coding[0].display,
      original: true,
    };
  } else {
    return null;
  }
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
  const resource = bundle && bundle.entry && bundle.entry[0] && bundle.entry[0].resource;
  return {
    cancerType: getCancerType(resource),
    cancerSubtype: getCancerSubtype(resource),
    stage: getStage(resource),
  };
};
