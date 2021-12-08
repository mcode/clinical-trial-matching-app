import { fhirclient } from 'fhirclient/lib/types';

export type PrimaryCancerCondition = {
  cancerType: string;
  cancerSubtype: string;
  stage: string;
  resource?: fhirclient.FHIR.Resource;
};

const getCancerType = (resource: fhirclient.FHIR.Resource): string =>
  resource?.bodySite?.[0]?.coding?.[0]?.display ?? null;

const getCancerSubtype = (resource: fhirclient.FHIR.Resource): string => resource?.code?.coding?.[0]?.display ?? null;

const getStage = (resource: fhirclient.FHIR.Resource): string =>
  resource?.stage?.[0]?.summary?.coding?.[0]?.display ?? null;

export const convertFhirSecondaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): string => {
  const resource = bundle?.entry?.[0]?.resource;
  return getCancerSubtype(resource);
};

export const convertFhirPrimaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): PrimaryCancerCondition => {
  const resource = bundle?.entry?.[0]?.resource;
  return {
    cancerType: getCancerType(resource),
    cancerSubtype: getCancerSubtype(resource),
    stage: getStage(resource),
    resource,
  };
};
