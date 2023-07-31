import biomarkerQualifiers from '@/assets/optimizedPatientDataElements/biomarkerQualifiers.json';
import biomarkers from '@/assets/optimizedPatientDataElements/biomarkers.json';
import cancerSubtypes from '@/assets/optimizedPatientDataElements/cancerSubtypes.json';
import cancerTypes from '@/assets/optimizedPatientDataElements/cancerTypes.json';
import ecogScores from '@/assets/optimizedPatientDataElements/ecogScores.json';
import karnofskyScores from '@/assets/optimizedPatientDataElements/karnofskyScores.json';
import medication from '@/assets/optimizedPatientDataElements/medications.json';
import metastases from '@/assets/optimizedPatientDataElements/metastases.json';
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
  | 'metastasis'
  | 'stage'
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

export const convertFhirKarnofskyPerformanceStatus = (bundle: fhirclient.FHIR.Bundle): Score | null => {
  const observation = bundle.entry?.[0]?.resource as Observation;
  const coding = observation?.interpretation?.[0]?.coding?.[0];
  return (karnofskyScores as Score[]).find(equalScore(coding)) || null;
};

export const convertFhirEcogPerformanceStatus = (bundle: fhirclient.FHIR.Bundle): Score | null => {
  const observation = bundle.entry?.[0]?.resource as Observation;
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
  name: `${fhirPatient.name[0].given[0]} ${fhirPatient.name[0].family}`,
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
export const extractPrimaryCancerCondition = (bundle: fhirclient.FHIR.Bundle): PrimaryCancerCondition | null => {
  if (Array.isArray(bundle.entry)) {
    // Go through each entry and see if we find data
    for (const entry of bundle.entry) {
      const condition = entry?.resource;
      if (condition && condition.resourceType === 'Condition') {
        const cancerType = getCancerType(condition as Condition);
        if (cancerType) {
          // For now, just return the first entry found
          return {
            cancerType: cancerType,
            cancerSubtype: getCancerSubtype(condition as Condition),
            stage: getStage(condition as Condition),
          };
        }
      }
    }
  }
  return null;
};

export const convertFhirRadiationProcedures = (bundle: fhirclient.FHIR.Bundle): CodedValueType[] => {
  const radiationProcedures = bundle?.entry?.map(entry => entry.resource as Procedure) || [];
  const radiations: CodedValueType[] = radiationProcedures.map(extractKnownCodes(radiation as CodedValueType[])).flat();
  return getUniques(radiations);
};

export const convertFhirSecondaryCancerConditions = (bundle: fhirclient.FHIR.Bundle): CodedValueType[] => {
  const secondaryCancerConditions = bundle?.entry?.map(entry => entry.resource as Condition) || [];
  const conditions: CodedValueType[] = secondaryCancerConditions
    .map(extractKnownCodes(metastases as CodedValueType[]))
    .flat();
  return getUniques(conditions);
};

export const convertFhirSurgeryProcedures = (bundle: fhirclient.FHIR.Bundle): CodedValueType[] => {
  const surgeryProcedures = bundle?.entry?.map(entry => entry.resource as Procedure) || [];
  const surgeries: CodedValueType[] = surgeryProcedures.map(extractKnownCodes(surgery as CodedValueType[])).flat();
  return getUniques(surgeries);
};

export const convertFhirTumorMarkers = (bundle: fhirclient.FHIR.Bundle): Biomarker[] => {
  const fhirTumorMarkers = bundle?.entry?.map(entry => entry.resource as Observation) || [];
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
        if (!!found) {
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
const equalStringArrays = (array1: string[], array2: string[]) => {
  return (array1 || []).sort().join(',') == (array2 || []).sort().join(',');
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
