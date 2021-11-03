import { fhirclient } from 'fhirclient/lib/types';

type FhirUser = fhirclient.FHIR.Patient | fhirclient.FHIR.Practitioner | fhirclient.FHIR.RelatedPerson;

type FhirUserName = {
  prefix: string;
  given: string[];
  family: string;
  suffix?: string[];
};

export type Patient = {
  id: string;
  name: string;
  gender: string;
  age: string;
  zipcode: string;
  record?: fhirclient.FHIR.Patient; // for debugging
};

export type PrimaryCancerCondition = {
  cancerType: string;
  cancerSubtype: string;
  stage: string;
};

export type User = {
  id: string;
  name: string;
  record?: FhirUser; // for debugging
};

export const convertFhirKarnofskyPerformanceStatus = (bundle: fhirclient.FHIR.Bundle): string => {
  const code = bundle.entry?.[0]?.resource?.interpretation?.[0]?.coding?.[0]?.code;

  switch (code) {
    case 'LA29175-9':
      return '100';

    case 'LA29176-7':
      return '90';

    case 'LA29177-5':
      return '80';

    case 'LA29178-3':
      return '70';

    case 'LA29179-1':
      return '60';

    case 'LA29180-9':
      return '50';

    case 'LA29181-7':
      return '40';

    case 'LA29182-5':
      return '30';

    case 'LA29183-3':
      return '20';

    case 'LA29184-1':
      return '10';

    case 'LA9627-6':
      return '0';

    default:
      return null;
  }
};

export const convertFhirEcogPerformanceStatus = (bundle: fhirclient.FHIR.Bundle): string => {
  const code = bundle.entry?.[0]?.resource?.interpretation?.[0]?.coding?.[0]?.code;

  switch (code) {
    case 'LA9622-7':
      return '0';

    case 'LA9623-5':
      return '1';

    case 'LA9624-3':
      return '2';

    case 'LA9625-0':
      return '3';

    case 'LA9626-8':
      return '4';

    case 'LA9627-6':
      return '5';

    default:
      return null;
  }
};

export const convertFhirMedicationStatements = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const medicationStatements = bundle.entry || [];
  const medications: string[] = [];
  for (const { resource } of medicationStatements) {
    const medication = resource?.medicationCodeableConcept?.coding?.[0]?.display;
    if (medication) medications.push(medication);
  }
  return medications;
};

export const convertFhirPatient = (fhirPatient: fhirclient.FHIR.Patient): Patient => ({
  id: fhirPatient.id,
  name: `${fhirPatient.name[0].given[0]} ${fhirPatient.name[0].family}`,
  gender: fhirPatient.gender,
  age: fhirPatient.birthDate ? getAge(fhirPatient.birthDate) : null,
  zipcode:
    fhirPatient.address?.length > 0 && fhirPatient.address[0].postalCode ? fhirPatient.address[0].postalCode : null,
  record: fhirPatient,
});

export const convertFhirPrimaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): PrimaryCancerCondition => {
  const resource = bundle?.entry?.[0]?.resource;
  return {
    cancerType: resource?.bodySite?.[0]?.coding?.[0]?.display ?? null,
    cancerSubtype: resource?.code?.coding?.[0]?.display ?? null,
    stage: resource?.stage?.[0]?.summary?.coding?.[0]?.display ?? null,
  };
};

export const convertFhirRadiationProcedures = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const radiationProcedures = bundle.entry || [];
  const radiations: string[] = [];
  for (const { resource } of radiationProcedures) {
    const radiation = resource?.code?.coding?.[0]?.display;
    if (radiation) radiations.push(radiation);
  }
  return radiations;
};

export const convertFhirSecondaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): string => {
  const resource = bundle?.entry?.[0]?.resource;
  return resource?.code?.coding?.[0]?.display;
};

export const convertFhirSurgeryProcedures = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const surgeryProcedures = bundle.entry || [];
  const surgeries: string[] = [];
  for (const { resource } of surgeryProcedures) {
    const surgery = resource?.code?.coding?.[0]?.display;
    if (surgery) surgeries.push(surgery);
  }
  return surgeries;
};

export const convertFhirTumorMarkers = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const fhirTumorMarkers = bundle.entry || [];
  const biomarkers: string[] = [];

  for (const { resource } of fhirTumorMarkers) {
    const marker = resource?.code?.coding?.[0]?.display;
    const status = resource?.valueCodeableConcept?.coding?.[0]?.display;
    const biomarker = `${marker} ${status}`;
    marker && status ? biomarkers.push(biomarker) : null;
  }

  return biomarkers;
};

export const convertFhirUser = (fhirUser: FhirUser): User => ({
  id: fhirUser.id,
  name: getUserName(fhirUser.name[0]),
  record: fhirUser,
});

const getAge = (dateString: Date): string => {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const months = today.getMonth() - birthDate.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) age--;
  return `${age}`;
};

const getUserName = (fhirUserName: FhirUserName): string => {
  const prefix = fhirUserName.prefix ? `${fhirUserName.prefix} ` : null;
  const fullName = `${fhirUserName.given.join(' ')} ${fhirUserName.family}`;
  const suffix = fhirUserName.suffix?.length > 0 ? `, ${fhirUserName.suffix[0]}` : null;
  return `${prefix || ''}${fullName}${suffix || ''}`;
};
