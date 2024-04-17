import { SNOMED_CODE_URI } from '@/utils/fhirConstants';
import { CancerType, CodedValueType } from '@/utils/fhirConversionUtils';
import { getJoinedCategories, getNewState, uninitializedState } from '../FormFieldsOptions';

jest.mock('@/assets/optimizedPatientDataElements/biomarkerQualifiers.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/biomarkers.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/cancerSubtypes.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/cancerTypes.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/diseaseStatuses.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/ecogScores.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/karnofskyScores.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/medications.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/metastases.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/radiations.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/restrictions.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/stages.json', () => []);
jest.mock('@/assets/optimizedPatientDataElements/surgeries.json', () => []);

const cancerType: CodedValueType = {
  code: '',
  system: SNOMED_CODE_URI,
  display: '',
  cancerType: [CancerType.PROSTATE],
  entryType: 'cancerType',
  category: ['category-1', 'category-2', 'category-3'],
};

describe('getJoinedCategories', () => {
  it('produces a string based off a list of categories', () => {
    expect(getJoinedCategories(cancerType)).toEqual('category-1 | category-2 | category-3');
    expect(getJoinedCategories({ ...cancerType, category: [] })).toEqual('');
  });
});

describe('getNewState', () => {
  it('gets all selectable biomarkers, cancer subtypes, cancer types, disease statuses, ECOG scores, Karnofsky scores, medications, metastases, radiations, stages, and surgeries based on the selected cancer type', () => {
    // TODO: Also mock the JSON files such that they resemble CodedValueType[], Score[], or Biomarker[]
    expect(getNewState(cancerType)).toEqual(uninitializedState);
  });
});
