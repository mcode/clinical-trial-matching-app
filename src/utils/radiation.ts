import { fhirclient } from 'fhirclient/lib/types';

export const convertFhirRadiationProcedures = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const radiationProcedures = bundle.entry || [];
  const radiations: string[] = [];
  for (const { resource } of radiationProcedures) {
    const radiation =
      resource.code && resource.code.coding && resource.code.coding[0] && resource.code.coding[0].display;
    radiation ? radiations.push(radiation) : null;
  }
  return radiations;
};
