import biomarkerQualifiers from '@/queries/mockData/biomarkerQualifiers.json';
import biomarkers from '@/queries/mockData/biomarkers.json';
import cancerSubtypes from '@/queries/mockData/cancerSubtypes.json';
import cancerTypes from '@/queries/mockData/cancerTypes.json';
import ecogScores from '@/queries/mockData/ecogScores.json';
import karnofskyScores from '@/queries/mockData/karnofskyScores.json';
import medications from '@/queries/mockData/medications.json';
import metastases from '@/queries/mockData/metastases.json';
import radiation from '@/queries/mockData/radiations.json';
import restrictions from '@/queries/mockData/restrictions.json';
import stages from '@/queries/mockData/stages.json';
import surgeries from '@/queries/mockData/surgeries.json';
import { Biomarker, CancerType, CodedValueType, Score } from '@/utils/fhirConversionUtils';
import { Coding } from 'fhir/r4';
import { State } from './types';

type Restriction = Pick<CodedValueType, 'cancerType' | 'category'> &
  Record<'restriction', Partial<Record<keyof State, Pick<CodedValueType, 'code' | 'system'>[]>>>;

const getCancerSpecificCodes = (cancerType: CodedValueType, codes: CodedValueType[]): CodedValueType[] =>
  codes.filter(c => c.cancerType.includes(cancerType.cancerType[0]));

const applyRestriction = (restricted: Partial<CodedValueType>[], original: CodedValueType[]): CodedValueType[] =>
  original.filter(c => restricted.some(({ code, system }) => code === c.code && system === c.system));

export const groupByCategories = (option: CodedValueType): string => option.category.join(' | ');

const byAscendingJoinedCategory = (first: CodedValueType, second: CodedValueType): number =>
  groupByCategories(first).localeCompare(groupByCategories(second));

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
  ecogScore: [],
  karnofskyScore: [],
  medications: [],
  metastasis: [],
  radiation: [],
  stage: [],
  surgery: [],
};
