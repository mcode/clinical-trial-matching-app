import { fhirclient } from 'fhirclient/lib/types';

type FhirUser = fhirclient.FHIR.Patient | fhirclient.FHIR.Practitioner | fhirclient.FHIR.RelatedPerson;

export type User = {
  id: string;
  name: string;
  record?: FhirUser; // for debugging
};

type FhirUserName = {
  prefix: string;
  given: string[];
  family: string;
  suffix?: string[];
};

const getName = (fhirUserName: FhirUserName): string => {
  const prefix = fhirUserName.prefix ? `${fhirUserName.prefix} ` : null;
  const fullName = `${fhirUserName.given.join(' ')} ${fhirUserName.family}`;
  const suffix = fhirUserName.suffix?.length > 0 ? `, ${fhirUserName.suffix[0]}` : null;
  return `${prefix || ''}${fullName}${suffix || ''}`;
};

export const convertFhirUser = (fhirUser: FhirUser): User => ({
  id: fhirUser.id,
  name: getName(fhirUser.name[0]),
  record: fhirUser,
});
