import { CodeableConcept, Condition, MedicationStatement, Observation, Procedure } from 'fhir/r4';
import { fhirclient } from 'fhirclient/lib/types';
const MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR =
  'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-histology-morphology-behavior';
const SNOMED_CODE_URI = 'http://snomed.info/sct';
type FhirUser = fhirclient.FHIR.Patient | fhirclient.FHIR.Practitioner | fhirclient.FHIR.RelatedPerson;
type FhirUserName = {
  prefix: string;
  given: string[];
  family: string;
  suffix?: string[];
};

export type CodedValueType = {
  entryType: string;
  code: string | number;
  display: string;
};

export type Patient = {
  id: string;
  name: string;
  gender: string;
  age: string;
  zipcode: string;
};

export type PrimaryCancerCondition = {
  cancerType: CodedValueType | null;
  cancerSubtype: CodedValueType | null;
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

export const convertFhirPrimaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): PrimaryCancerCondition => {
  const condition = bundle?.entry?.[0]?.resource as Condition;
  return {
    cancerType: getCancerType(condition),
    cancerSubtype: getCancerSubtype(condition),
    stage: getStage(condition),
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

// ----- HELPERS ----- //

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

const getDisplays = (resource: { medicationCodeableConcept?: CodeableConcept; code?: CodeableConcept }): string[] => {
  if (resource?.code) {
    return resource?.code?.coding?.map(coding => coding.display);
  } else if (resource?.medicationCodeableConcept) {
    return resource?.medicationCodeableConcept?.coding?.map(coding => coding.display);
  }
  return [];
};

/***
 * Type guard for the CodedValueType
 */
export const isCodedValueType = (o: unknown): o is CodedValueType => {
  if (typeof o === 'object' && o !== null) {
    const code = o as CodedValueType;
    return typeof code.display === 'string' && (typeof code.code === 'string' || typeof code.code === 'number');
  } else {
    return false;
  }
};

/**
 * Parses a string that contains a JSON description of a named SNOMED code to a CodedValueType object.
 * @param code the code to convert
 * @returns the parsed code
 */
export const parseCodedValue = (code: string): CodedValueType => {
  try {
    const result: CodedValueType = JSON.parse(code);
    // Make sure this is valid
    return isCodedValueType(result) ? result : undefined;
  } catch (ex) {
    // JSON parse error, return undefined
    return undefined;
  }
};
export const parseCodedValueArray = (code: string): CodedValueType[] => {
  try {
    const result: CodedValueType[] = JSON.parse(code);
    for (let i = 0; i < result.length; i++) {
      if (!isCodedValueType(result[i])) {
        return undefined;
      }
    }
    return result;
  } catch (ex) {
    // JSON parse error, return undefined
    return undefined;
  }
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

const getCancerType = (condition: Condition): CodedValueType | null => {
  if (Array.isArray(condition?.code?.coding)) {
    // Prefer SNOMED over anything else, else take the first code with a display
    let code = condition.code.coding.find(({ system }) => system === SNOMED_CODE_URI);
    if (!code) code = condition.code.coding.find(({ display }) => Boolean(display));

    if (code) {
      return {
        entryType: 'CancerSubType',
        code: code.code,
        display: code.display ?? code.code,
      };
    }
  }

  return null;
};

const getCancerSubtype = (condition: Condition): CodedValueType | null => {
  if (Array.isArray(condition?.extension)) {
    for (const extension of condition.extension) {
      if (
        extension.url === MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR &&
        extension.valueCodeableConcept?.coding?.[0]?.system === SNOMED_CODE_URI
      ) {
        const code = extension.valueCodeableConcept.coding[0];
        return {
          entryType: 'CancerSubType',
          code: code.code,
          display: code.display ?? code.code,
        };
      }
    }
  }

  return null;
};
