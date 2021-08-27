import { fhirclient } from 'fhirclient/lib/types';

type FhirUser = fhirclient.FHIR.Patient | fhirclient.FHIR.Practitioner | fhirclient.FHIR.RelatedPerson;

export type User = {
  id: string;
  name: string;
  record?: FhirUser; // for debugging
};

export const convertFhirUser = (fhirUser: FhirUser): User => ({
  id: fhirUser.id,
  name: `${fhirUser.name[0].prefix || ''} ${fhirUser.name[0].given[0]} ${fhirUser.name[0].family}`,
  record: fhirUser,
});
