import { fhirclient } from 'fhirclient/lib/types';

const getMarker = (resource: fhirclient.FHIR.Resource): string => {
  return resource?.code?.coding?.[0]?.display;
};

const getStatus = (resource: fhirclient.FHIR.Resource): string => {
  return resource?.valueCodeableConcept?.coding?.[0].display;
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
