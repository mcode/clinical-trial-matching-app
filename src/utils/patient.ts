import { fhirclient } from 'fhirclient/lib/types';

export type Patient = {
  id: string;
  name: string;
  gender: string;
  age: number;
  record?: fhirclient.FHIR.Patient; // for debugging
};

const getAge = (dateString: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const months = today.getMonth() - birthDate.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

export const convertFhirPatient = (fhirPatient: fhirclient.FHIR.Patient): Patient => ({
  id: fhirPatient.id,
  name: `${fhirPatient.name[0].given[0]} ${fhirPatient.name[0].family}`,
  gender: fhirPatient.gender,
  age: getAge(fhirPatient.birthDate),
  record: fhirPatient,
});
