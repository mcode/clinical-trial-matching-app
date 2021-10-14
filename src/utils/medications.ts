import { fhirclient } from 'fhirclient/lib/types';

export const convertFhirMedicationStatements = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const medicationStatements = bundle.entry || [];
  const medications: string[] = [];
  for (const { resource } of medicationStatements) {
    const medication =
      resource.medicationCodeableConcept &&
      resource.medicationCodeableConcept.coding &&
      resource.medicationCodeableConcept.coding[0] &&
      resource.medicationCodeableConcept.coding[0].display;
    medication ? medications.push(medication) : null;
  }
  return medications;
};
