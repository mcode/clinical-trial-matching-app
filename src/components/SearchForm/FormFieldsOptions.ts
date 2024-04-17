import biomarkerQualifiers from '@/assets/optimizedPatientDataElements/biomarkerQualifiers.json';
import biomarkers from '@/assets/optimizedPatientDataElements/biomarkers.json';
import cancerSubtypes from '@/assets/optimizedPatientDataElements/cancerSubtypes.json';
import cancerTypes from '@/assets/optimizedPatientDataElements/cancerTypes.json';
import diseaseStatuses from '@/assets/optimizedPatientDataElements/diseaseStatuses.json';
import ecogScores from '@/assets/optimizedPatientDataElements/ecogScores.json';
import karnofskyScores from '@/assets/optimizedPatientDataElements/karnofskyScores.json';
import medications from '@/assets/optimizedPatientDataElements/medications.json';
import metastases from '@/assets/optimizedPatientDataElements/metastases.json';
import radiation from '@/assets/optimizedPatientDataElements/radiations.json';
import restrictions from '@/assets/optimizedPatientDataElements/restrictions.json';
import stages from '@/assets/optimizedPatientDataElements/stages.json';
import surgeries from '@/assets/optimizedPatientDataElements/surgeries.json';
import { Biomarker, CancerType, CodedValueType, Score } from '@/utils/fhirConversionUtils';
import { Coding } from 'fhir/r4';
import { State } from './types';

type Restriction = Pick<CodedValueType, 'cancerType' | 'category'> &
  Record<'restriction', Partial<Record<keyof State, Pick<CodedValueType, 'code' | 'system'>[]>>>;

const getCancerSpecificCodes = (cancerType: CodedValueType, codes: CodedValueType[]): CodedValueType[] =>
  cancerType == null ? [] : codes.filter(c => c.cancerType.includes(cancerType.cancerType[0]));

const applyRestriction = (restricted: Partial<CodedValueType>[], original: CodedValueType[]): CodedValueType[] =>
  original.filter(c => restricted.some(({ code, system }) => code === c.code && system === c.system));

export const getJoinedCategories = (option: CodedValueType): string => option.category.join(' | ');

const byAscendingJoinedCategory = (first: CodedValueType, second: CodedValueType): number =>
  getJoinedCategories(first).localeCompare(getJoinedCategories(second));

const byAscendingScore = (first: Score, second: Score): number => first.valueInteger - second.valueInteger;

const createRestrictedAndUnrestrictedValues = (first: CodedValueType): CodedValueType[] => {
  const categories = restrictions
    .filter(({ restriction }) =>
      restriction.cancerType.some(second => first.code === second.code && first.system === second.system)
    )
    .map(({ category }) => category)
    .flat();
  const restricted = first.category.filter(category => categories.includes(category));
  const unrestricted = first.category.filter(category => !categories.includes(category));
  return [...restricted, ...(unrestricted.length !== 0 ? [unrestricted] : unrestricted)].map(entry => ({
    ...first,
    category: Array.isArray(entry) ? entry : [entry],
  }));
};

const getRestriction = (selectedCancerType: CodedValueType): Restriction | undefined => {
  if (selectedCancerType == null) {
    return undefined;
  }
  return (restrictions as Restriction[]).find((entry: Restriction) => {
    const matchesOnOverallCancerType = entry.cancerType.some((entryType: CancerType) =>
      selectedCancerType.cancerType.includes(entryType)
    );
    const matchesOnCategory = entry.category.some(category => selectedCancerType.category.includes(category));
    const matchesOnCancerType = !!entry.restriction.cancerType.find(
      (c: Coding) => c.code === selectedCancerType.code && c.system === selectedCancerType.system
    );
    return matchesOnOverallCancerType && matchesOnCategory && matchesOnCancerType;
  });
};

export const getNewState = (selectedCancerType: CodedValueType): State => {
  /* Until we get more information on stage values for all of the cancer types, let's allow
  all stages for now, unless the stage affects certain wrapper mappings. We know multiple
  myeloma is a liquid cancer and won't use the solid tumor stage 1-4 values, but we're going
  off the current mCODE profile for stage values. Also, let's not restrict the medications,
  biomarkers, medications, surgeries, and radiations since it's possible the patient may have
  had prior treatments for a different condition. */
  const unrestricted = {
    biomarkers: biomarkers
      .map(biomarker => biomarkerQualifiers.map((qualifier: Coding) => ({ ...biomarker, qualifier })))
      .flat() as Biomarker[],
    cancerSubtype: getCancerSpecificCodes(selectedCancerType, cancerSubtypes as CodedValueType[]),
    cancerType: (cancerTypes as CodedValueType[]).map(createRestrictedAndUnrestrictedValues).flat(),
    diseaseStatus: diseaseStatuses as CodedValueType[],
    ecogScore: ecogScores as Score[],
    karnofskyScore: karnofskyScores as Score[],
    medications: medications as CodedValueType[],
    metastasis: metastases as CodedValueType[],
    radiation: radiation as CodedValueType[],
    stage: stages as CodedValueType[],
    surgery: surgeries as CodedValueType[],
  };

  const { restriction } = { ...getRestriction(selectedCancerType) };
  const stage = restriction?.stage as Partial<CodedValueType>[];

  const restricted = { stage: stage ? applyRestriction(stage, unrestricted.stage) : unrestricted.stage };

  const newState = { ...unrestricted, ...restricted };

  // The MUI Autocomplete groupBy prop may create duplicate labels if the options are unsorted.
  for (const field in newState) {
    if (Array.isArray(newState[field]) && newState[field].length !== 0) {
      const firstEntry = newState[field][0];
      if ('category' in firstEntry) {
        newState[field] = [...newState[field]].sort(byAscendingJoinedCategory);
      }
      if ('valueInteger' in firstEntry) {
        newState[field] = [...newState[field]].sort(byAscendingScore);
      }
    }
  }

  return newState;
};

export const uninitializedState: State = {
  biomarkers: [],
  cancerSubtype: [],
  cancerType: [],
  diseaseStatus: [],
  ecogScore: [],
  karnofskyScore: [],
  medications: [],
  metastasis: [],
  radiation: [],
  stage: [],
  surgery: [],
};
