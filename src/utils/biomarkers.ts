import { fhirclient } from 'fhirclient/lib/types';

const getMarker = (resource: fhirclient.FHIR.Resource): string => {
  return (
    resource && resource.code && resource.code.coding && resource.code.coding[0] && resource.code.coding[0].display
  );
};

const getStatus = (resource: fhirclient.FHIR.Resource): string => {
  return (
    resource &&
    resource.valueCodeableConcept &&
    resource.valueCodeableConcept.coding &&
    resource.valueCodeableConcept.coding[0] &&
    resource.valueCodeableConcept.coding[0].display
  );
};

export const convertFhirTumorMarkers = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const fhirTumorMarkers = bundle.entry || [];
  const biomarkers: string[] = [];
  for (const { resource } of fhirTumorMarkers) {
    const marker = getMarker(resource);
    const status = getStatus(resource);
    const biomarker = `${marker} ${status}`;
    marker && status ? biomarkers.push(biomarker) : null;
  }
  return biomarkers;
};
