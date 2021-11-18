import { CodeableConcept, Coding, Condition, MedicationStatement, Observation, Procedure } from 'fhir/r4';
import { fhirclient } from 'fhirclient/lib/types';
import { CancerCode } from './cancerTypes';
import { SNOMED_CODE_URI } from './snomed';

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
};

export type PrimaryCancerCondition = {
  cancerType: CancerCode;
  cancerSubtype: string;
  stage: string;
};

export type User = {
  id: string;
  name: string;
  record?: FhirUser; // for debugging
};

export const convertFhirKarnofskyPerformanceStatus = (bundle: fhirclient.FHIR.Bundle): string => {
  const loincToKarnofskyMap = {
    'LA29175-9': '100',
    'LA29176-7': '90',
    'LA29177-5': '80',
    'LA29178-3': '70',
    'LA29179-1': '60',
    'LA29180-9': '50',
    'LA29181-7': '40',
    'LA29182-5': '30',
    'LA29183-3': '20',
    'LA29184-1': '10',
    'LA9627-6': '0',
  };

  const observation = bundle.entry?.[0]?.resource as Observation;
  const code = observation?.interpretation?.[0]?.coding?.[0]?.code;
  return loincToKarnofskyMap[code] ?? null;
};

export const convertFhirEcogPerformanceStatus = (bundle: fhirclient.FHIR.Bundle): string => {
  const loincToEcogMap = {
    'LA9622-7': '0',
    'LA9623-5': '1',
    'LA9624-3': '2',
    'LA9625-0': '3',
    'LA9626-8': '4',
    'LA9627-6': '5',
  };

  const observation = bundle.entry?.[0]?.resource as Observation;
  const code = observation?.interpretation?.[0]?.coding?.[0]?.code;
  return loincToEcogMap[code] ?? null;
};

export const convertFhirMedicationStatements = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const medicationStatements = bundle.entry?.map(entry => entry.resource as MedicationStatement) || [];
  const medications: string[][] = medicationStatements.map(getDisplays);
  return getUniques(medications.flat());
};

export const convertFhirPatient = (fhirPatient: fhirclient.FHIR.Patient): Patient => ({
  id: fhirPatient.id,
  name: `${fhirPatient.name[0].given[0]} ${fhirPatient.name[0].family}`,
  gender: fhirPatient.gender,
  age: fhirPatient.birthDate ? getAge(fhirPatient.birthDate) : null,
  zipcode:
    fhirPatient.address?.length > 0 && fhirPatient.address[0].postalCode ? fhirPatient.address[0].postalCode : null,
});

const getCancerType = (resource: fhirclient.FHIR.Resource): CancerCode | null => {
  if (!resource || resource.resourceType !== 'Condition') {
    return null;
  }
  // Grab the text from the coding for this
  const code = resource.code as CodeableConcept;
  if (code.coding && code.coding.length > 0) {
    let coding: Coding | null = null;
    for (const c of code.coding) {
      if (c.system === SNOMED_CODE_URI) {
        if (coding?.system !== SNOMED_CODE_URI) {
          // Prefer SNOMED over anything else
          coding = c;
        }
      } else if (!coding && c.display) {
        // Use anything with a display value if we have one
        coding = c;
      }
    }
    if (coding) {
      return {
        display: coding.display ?? coding.code,
        fromPatient: true,
      };
    }
  }
  return null;
};

const getCancerSubtype = (resource: fhirclient.FHIR.Resource): string => {
  return (
    (resource && resource.code && resource.code.coding && resource.code.coding[0] && resource.code.coding[0].display) ||
    null
  );
};

export const convertFhirPrimaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): PrimaryCancerCondition => {
  // Conceptually there can be multiple results for this. For now, just use the first.
  const resource = bundle && bundle.entry && bundle.entry[0] && bundle.entry[0].resource;
  return {
    cancerType: getCancerType(resource),
    cancerSubtype: getCancerSubtype(resource),
    stage: getStage(resource as Condition),
  };
};

export const convertFhirRadiationProcedures = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const radiationProcedures = bundle?.entry?.map(entry => entry.resource as Procedure) || [];
  const radiations: string[][] = radiationProcedures.map(getDisplays);
  return getUniques(radiations.flat());
};

export const convertFhirSecondaryCancerConditions = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const secondaryCancerConditions = bundle?.entry?.map(entry => entry.resource as Condition) || [];
  const conditions: string[][] = secondaryCancerConditions.map(getDisplays);
  return getUniques(conditions.flat());
};

export const convertFhirSurgeryProcedures = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const surgeryProcedures = bundle?.entry?.map(entry => entry.resource as Procedure) || [];
  const surgeries: string[][] = surgeryProcedures.map(getDisplays);
  return getUniques(surgeries.flat());
};

export const convertFhirTumorMarkers = (bundle: fhirclient.FHIR.Bundle): string[] => {
  const fhirTumorMarkers = bundle?.entry?.map(entry => entry.resource as Observation) || [];
  const biomarkers: string[][] = fhirTumorMarkers.map(convertTumorMarkersToBiomarkers);
  return getUniques(biomarkers.flat());
};

export const convertFhirUser = (fhirUser: FhirUser): User => ({
  id: fhirUser.id,
  name: getUserName(fhirUser.name[0]),
  record: fhirUser,
});

const getAge = (dateString: Date): string => {
  const now = Date.now();
  const today = new Date(now);
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

const getUniques = (array: string[]) => [...new Set(array)];

const convertTumorMarkersToBiomarkers = (tumorMarker: Observation): string[] => {
  const loincToDisplayMap = {
    '40556-3': 'ER Ag Tiss Ql ImStn',
    '40557-1': 'PR Ag Tiss Ql ImStn',
    '18474-7': 'Her2 Ag Tiss Ql ImStn',
    '62862-8': 'MSI Tiss Ql ImStn',
    '48676-1': 'Her2 Tiss-Imp',
    '85319-2': 'Her2 Br ca spec Ql ImStn',
    '85318-4': 'ERBB2 gene Dp Br ca spec Ql FISH',
    '16112-5': 'ER Tiss-Imp',
    '85337-4': 'ER Ag Br ca spec Ql ImStn',
    '16113-3': 'PR Tiss-Imp',
    '85339-0': 'PR Ag Br ca spec Ql ImStn',
  };

  const snomedToDisplayMap = {
    '10828004': '+', // positive
    '260385009': '-', // negative
    '82334004': '?', // indeterminate
  };

  const markerCodings = tumorMarker.code?.coding;
  const statusCoding = tumorMarker.valueCodeableConcept?.coding;
  const statusCode = statusCoding?.[0]?.code;
  const markers = markerCodings.map(coding => loincToDisplayMap[coding.code] ?? coding.display);
  const status = snomedToDisplayMap[statusCode] ?? statusCoding?.[0]?.display;
  return status ? markers.map(marker => `${marker} ${status}`) : [];
};

const getDisplays = (resource: { medicationCodeableConcept?: CodeableConcept; code?: CodeableConcept }): string[] => {
  if (resource?.code) {
    return resource?.code?.coding?.map(coding => coding.display);
  } else if (resource?.medicationCodeableConcept) {
    return resource?.medicationCodeableConcept?.coding?.map(coding => coding.display);
  }
  return [];
};

const getStage = (condition: Condition): string => {
  const snomedToStageMap = {
    '261613009': '0',
    '258215001': 'I',
    '258219007': 'II',
    '261614003': 'IIA',
    '258224005': 'III',
    '258228008': 'IV',
    '261617005': 'V',
  };

  const cancerStagingToStageMap = {
    c2A: 'IIA',
    c2: 'II',
    '4': 'IV',
  };

  // patient could have >1 stages
  const stages = condition?.stage
    ?.map(stage =>
      stage.summary?.coding?.map(
        coding => snomedToStageMap[coding.code] || cancerStagingToStageMap[coding.code] || coding.display
      )
    )
    .flat();

  // get the first found stage for now
  return stages?.length ? stages[0] : null;
};
