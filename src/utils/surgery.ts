import { fhirclient } from 'fhirclient/lib/types';

export const convertFhirSurgeryProcedures = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const surgeryProcedures = bundle.entry || [];
  console.log('surgeryProcedures', surgeryProcedures);
  const surgeries: string[] = [];
  for (const { resource } of surgeryProcedures) {
    const surgery = resource.code && resource.code.coding && resource.code.coding[0] && resource.code.coding[0].display;
    surgery ? surgeries.push(surgery) : null;
  }
  return surgeries;
};
