import { fhirclient } from 'fhirclient/lib/types';

export type PrimaryCancerCondition = {
  cancerType: string;
  cancerSubtype: string;
  stage: string;
};

const getCancerType = (resource: fhirclient.FHIR.Resource): string => {
  return (
    resource.bodySite &&
    resource.bodySite[0] &&
    resource.bodySite[0].coding &&
    resource.bodySite[0].coding[0] &&
    resource.bodySite[0].coding[0].display
  );
};

const getCancerSubtype = (resource: fhirclient.FHIR.Resource): string => {
  return resource.code && resource.code.coding && resource.code.coding[0] && resource.code.coding[0].display;
};

const getStage = (resource: fhirclient.FHIR.Resource): string => {
  return (
    resource &&
    resource.stage &&
    resource.stage[0] &&
    resource.stage[0].summary &&
    resource.stage[0].summary.coding &&
    resource.stage[0].summary.coding[0] &&
    resource.stage[0].summary.coding[0].display
  );
};

export const convertFhirSecondaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): string => {
  const resource = bundle.entry && bundle.entry[0] && bundle.entry[0].resource;
  return resource ? getCancerSubtype(resource) : null;
};

export const convertFhirPrimaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): PrimaryCancerCondition => {
  const resource = bundle.entry && bundle.entry[0] && bundle.entry[0].resource;
  return {
    cancerType: resource ? getCancerType(resource) : null,
    cancerSubtype: resource ? getCancerSubtype(resource) : null,
    stage: resource ? getStage(resource) : null,
  };
};
