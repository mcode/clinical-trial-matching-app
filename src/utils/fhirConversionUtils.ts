import biomarkerQualifiers from '@/assets/optimizedPatientDataElements/biomarkerQualifiers.json';
import biomarkers from '@/assets/optimizedPatientDataElements/biomarkers.json';
import cancerSubtypes from '@/assets/optimizedPatientDataElements/cancerSubtypes.json';
import cancerTypes from '@/assets/optimizedPatientDataElements/cancerTypes.json';
import diseaseStatuses from '@/assets/optimizedPatientDataElements/diseaseStatuses.json';
import ecogScores from '@/assets/optimizedPatientDataElements/ecogScores.json';
import karnofskyScores from '@/assets/optimizedPatientDataElements/karnofskyScores.json';
import medication from '@/assets/optimizedPatientDataElements/medications.json';
import metastases from '@/assets/optimizedPatientDataElements/metastases.json';
import metastasesStages from '@/assets/optimizedPatientDataElements/metastasesStages.json';
import nodalDiseaseStages from '@/assets/optimizedPatientDataElements/nodalDiseaseStages.json';
import primaryTumorStages from '@/assets/optimizedPatientDataElements/primaryTumorStages.json';
import radiation from '@/assets/optimizedPatientDataElements/radiations.json';
import stages from '@/assets/optimizedPatientDataElements/stages.json';
import surgery from '@/assets/optimizedPatientDataElements/surgeries.json';
import { SearchFormValuesType } from '@/components/SearchForm';
import { Coding, Condition, FhirResource, Medication, Observation, Procedure } from 'fhir/r4';
import { fhirclient } from 'fhirclient/lib/types';
import {
  ICD_10_CODE_URI,
  LOINC_CODE_URI,
  MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR,
  RXNORM_CODE_URI,
  SNOMED_CODE_URI,
} from './fhirConstants';

type FhirUser = fhirclient.FHIR.Patient | fhirclient.FHIR.Practitioner | fhirclient.FHIR.RelatedPerson;
type FhirUserName = {
  prefix: string;
  given: string[];
  family: string;
  suffix?: string[];
};

export enum CancerType {
  BREAST = 'breast',
  BRAIN = 'brain',
  LUNG = 'lung',
  COLON = 'colon',
  PROSTATE = 'prostate',
  MULTIPLE_MYELOMA = 'multipleMyeloma',
}

export type Field = keyof Pick<
  SearchFormValuesType,
  | 'cancerType'
  | 'cancerSubtype'
  | 'diseaseStatus'
  | 'metastasis'
  | 'stage'
  | 'primaryTumorStage'
  | 'nodalDiseaseStage'
  | 'metastasesStage'
  | 'ecogScore'
  | 'karnofskyScore'
  | 'biomarkers'
  | 'radiation'
  | 'surgery'
  | 'medications'
>;

export type CodedValueType = Required<Pick<Coding, 'code' | 'display' | 'system'>> & {
  system: typeof SNOMED_CODE_URI | typeof LOINC_CODE_URI | typeof RXNORM_CODE_URI | typeof ICD_10_CODE_URI;
  entryType: Field;
  cancerType: CancerType[];
  category: string[];
};

export type Biomarker = CodedValueType & { qualifier: Coding };

export type Score = {
  entryType: Field;
  interpretation: Required<Pick<Coding, 'code' | 'display' | 'system'>>;
  valueInteger: number;
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
  stage: CodedValueType | null;
};

export type User = {
  id: string;
  name: string;
  record?: FhirUser; // for debugging
};

export const convertFhirKarnofskyPerformanceStatus = (observation: Observation): Score | null => {
  const coding = observation?.interpretation?.[0]?.coding?.[0];
  return (karnofskyScores as Score[]).find(equalScore(coding)) || null;
};

export const convertFhirEcogPerformanceStatus = (observation: Observation): Score | null => {
  const coding = observation?.interpretation?.[0]?.coding?.[0];
  return (ecogScores as Score[]).find(equalScore(coding)) || null;
};

export const extractMedicationCodes = (medications: Medication[]): CodedValueType[] => {
  const extractCodes = extractKnownCodes(medication as CodedValueType[]);
  const medicationCodes: CodedValueType[] = medications
    .map(med => {
      return extractCodes(med);
    })
    .flat();
  return getUniques(medicationCodes);
};

export const convertFhirPatient = (fhirPatient: fhirclient.FHIR.Patient): Patient => ({
  id: fhirPatient.id,
  name: `${fhirPatient.name?.[0]?.given?.[0]} ${fhirPatient.name?.[0]?.family}`,
  gender: fhirPatient.gender,
  age: fhirPatient.birthDate ? getAge(fhirPatient.birthDate) : null,
  zipcode:
    fhirPatient.address?.length > 0 && fhirPatient.address[0].postalCode ? fhirPatient.address[0].postalCode : null,
});

/**
 * Attempts to locate cancer information within a patient bundle.
 * @param bundle the bundle to find a known cancer condition in
 * @returns a primary cancer condition
 */
export const extractPrimaryCancerCondition = (conditions: Condition[]): PrimaryCancerCondition | null => {
  // Go through each entry and see if we find data
  for (const condition of conditions) {
    const cancerType = getCancerType(condition);
    if (cancerType) {
      // For now, just return the first entry found
      return {
        cancerType: cancerType,
        cancerSubtype: getCancerSubtype(condition),
        stage: getStage(condition),
      };
    }
  }
  return null;
};

export const convertFhirPrimaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): PrimaryCancerCondition => {
  const condition = bundle?.entry?.[0]?.resource as Condition;
  return {
    cancerType: getCancerType(condition),
    cancerSubtype: getCancerSubtype(condition),
    stage: getStage(condition),
  };
};

export const convertFhirRadiationProcedures = (procedures: Procedure[]): CodedValueType[] =>
  getUniques(procedures.map(extractKnownCodes(radiation as CodedValueType[])).flat());

export const convertFhirSecondaryCancerConditions = (conditions: Condition[]): CodedValueType[] =>
  getUniques(conditions.map(extractKnownCodes(metastases as CodedValueType[])).flat());

export const convertFhirDiseaseStatus = (observation: Observation): CodedValueType => {
  const diseaseStatus = observation.valueCodeableConcept?.coding
    ?.map(code => diseaseStatuses.find(equalCodedValueType(code as CodedValueType)))
    .flat()
    .filter(e => !!e)?.[0] as CodedValueType;

  return diseaseStatus || null;
};

export const convertFhirPrimaryTumorStage =(observation: Observation): CodedValueType => {
  const pts = observation.valueCodeableConcept?.coding
    ?.map(code => primaryTumorStages.find(equalCodedValueType(code as CodedValueType)))
    .flat()
    .filter(e => !!e)?.[0] as CodedValueType;

  return pts || null;
};

export const convertFhirNodalDiseaseStage =(observation: Observation): CodedValueType => {
  const nds = observation.valueCodeableConcept?.coding
    ?.map(code => nodalDiseaseStages.find(equalCodedValueType(code as CodedValueType)))
    .flat()
    .filter(e => !!e)?.[0] as CodedValueType;

  return nds || null;
};

export const convertFhirMetastasesStage =(observation: Observation): CodedValueType => {
  const ms = observation.valueCodeableConcept?.coding
    ?.map(code => metastasesStages.find(equalCodedValueType(code as CodedValueType)))
    .flat()
    .filter(e => !!e)?.[0] as CodedValueType;

  return ms || null;
};

export const convertFhirSurgeryProcedures = (procedures: Procedure[]): CodedValueType[] =>
  getUniques(procedures.map(extractKnownCodes(surgery as CodedValueType[])).flat());

export const convertFhirTumorMarkers = (fhirTumorMarkers: Observation[]): Biomarker[] => {
  const biomarkers: Biomarker[] = fhirTumorMarkers.map(convertTumorMarkersToBiomarkers).flat();
  return getUniques(biomarkers);
};

export const convertFhirUser = (fhirUser: FhirUser): User => ({
  id: fhirUser.id,
  name: getUserName(fhirUser.name[0]),
  record: fhirUser,
});

// ----- HELPERS ----- //

const convertTumorMarkersToBiomarkers = (tumorMarker: Observation): Biomarker[] => {
  const markerCodings = tumorMarker.code?.coding || [];
  const statusCoding = tumorMarker.valueCodeableConcept?.coding || [];
  const markers = markerCodings
    .map(coding => biomarkers.find(equalCodedValueType(coding)) as CodedValueType)
    .filter(e => !!e);
  const status = statusCoding
    .map(coding => biomarkerQualifiers.find(equalCodedValueType(coding)) as Coding)
    .filter(e => !!e);
  return markers.map(marker => status.map(qualifier => ({ ...marker, qualifier } as Biomarker))).flat();
};

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

const getUniques = <T extends CodedValueType | Biomarker>(array: T[]): T[] => {
  return array.filter(
    (first: T, index: number) =>
      array.findIndex((second: T) => {
        const isBiomarker = 'qualifier' in first && 'qualifier' in second;
        return first.code === second.code && (isBiomarker ? first.qualifier === second.qualifier : true);
      }) === index
  );
};

/**
 * Returns a function that extracts codes from the given list of known codes.
 * @param knownCodes an array of known CodedValueTypes
 * @returns an array of matching known codes from the given array
 */
const extractKnownCodes =
  (knownCodes: CodedValueType[]) =>
  (resource: FhirResource): CodedValueType[] => {
    let codings: Coding[];
    if (
      (resource.resourceType === 'Procedure' ||
        resource.resourceType === 'Condition' ||
        resource.resourceType === 'Medication') &&
      resource.code
    ) {
      codings = resource.code?.coding;
    } else if (
      (resource.resourceType === 'MedicationRequest' || resource.resourceType === 'MedicationStatement') &&
      resource.medicationCodeableConcept
    ) {
      codings = resource.medicationCodeableConcept?.coding;
    }
    return codings ? codings.map(coding => knownCodes.find(equalCodedValueType(coding))).filter(e => !!e) : [];
  };

const getStage = (condition: Condition): CodedValueType | null => {
  // patient could have >1 stages
  const stage = condition?.stage
    ?.map(stage => stage.summary?.coding?.map(coding => (stages as CodedValueType[]).find(equalCodedValueType(coding))))
    .flat()
    .filter(e => !!e)?.[0];

  // get the first found stage for now
  return stage || null;
};

const getCancerType = (condition: Condition): CodedValueType | null => {
  if (Array.isArray(condition?.code?.coding)) {
    const coding = condition.code.coding.find(({ system }) => system === SNOMED_CODE_URI);
    return (cancerTypes as CodedValueType[]).find(equalCodedValueType(coding));
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
        const coding = extension.valueCodeableConcept.coding[0];
        const found = (cancerSubtypes as CodedValueType[]).find(equalCodedValueType(coding));
        if (found) {
          return found;
        }
      }
    }
  }

  return null;
};

const equalCodedValueType =
  (selected: Coding) =>
  (target: CodedValueType): boolean =>
    selected?.code === target.code && selected?.system === target.system;

export const isEqualCodedValueType = (originalValue: CodedValueType, newValue: CodedValueType): boolean => {
  return (
    equalStringArrays(originalValue?.cancerType, newValue?.cancerType) &&
    equalStringArrays(originalValue?.category, newValue?.category) &&
    originalValue?.code == newValue?.code &&
    originalValue?.display == newValue?.display &&
    originalValue?.entryType == newValue?.entryType &&
    originalValue?.system == newValue?.system
  );
};

const equalStringArrays = (arrayLeft: string[] | undefined, arrayRight: string[] | undefined) => {
  if (arrayLeft === undefined) {
    return arrayRight === undefined;
  }
  if (arrayRight === undefined) {
    // arrayLeft cannot be undefined as well
    return false;
  }
  // Fail fast: different lengths? Not equal!
  if (arrayLeft.length !== arrayRight.length) {
    return false;
  }
  // This is interested in if the contents of both arrays are the same,
  // regardless of order.
  const mapLeft = arrayValueCountsMap(arrayLeft),
    mapRight = arrayValueCountsMap(arrayRight);
  const left = Array.from(mapLeft.entries()),
    right = Array.from(mapRight.entries());
  if (left.length != right.length) {
    return false;
  }
  for (let idx = 0; idx < left.length; idx++) {
    if (left[idx][0] != right[idx][0] && left[idx][1] != right[idx][1]) {
      return false;
    }
  }
  // Gone through all of these? True
  return true;
};

const arrayValueCountsMap = <T>(array: T[]): Map<T, number> => {
  const map = new Map<T, number>();
  for (const value of array) {
    if (map.has(value)) {
      map.set(value, map.get(value) + 1);
    } else {
      map.set(value, 1);
    }
  }
  return map;
};

const equalScore =
  (selected: Coding) =>
  (target: Score): boolean =>
    target.interpretation.code === selected?.code && target.interpretation.system === selected?.system;

export const isEqualScore = (originalValue: Score, newValue: Score): boolean => {
  return (
    originalValue?.entryType == newValue?.entryType &&
    originalValue?.interpretation.code == newValue?.interpretation?.code &&
    originalValue?.valueInteger == newValue?.valueInteger
  );
};
