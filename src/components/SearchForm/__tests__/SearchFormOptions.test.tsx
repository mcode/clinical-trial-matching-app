import { compareByProperty } from '../SearchFormOptions';

const expectSortedJSONArray = [
  {
    category: '',
    cancerType: '',
    code: '18474-7',
    display: 'HER2 Ag [Presence] in Tissue by Immune stain',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
  {
    category: '',
    cancerType: '',
    code: '48676-1',
    display: 'HER2 [Interpretation] in Tissue',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
  {
    category: '',
    cancerType: '',
    code: '32996-1',
    display: 'HER2 [Mass/volume] in Serum',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
  {
    category: '',
    cancerType: '',
    code: '42914-2',
    display: 'HER2 [Mass/volume] in Serum by Immunoassay',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
  {
    category: '',
    cancerType: '',
    code: '85318-4',
    display: 'HER2 [Presence] in Breast cancer specimen by FISH',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
];

const unSortedJSONArray = [
  {
    category: '',
    cancerType: '',
    code: '42914-2',
    display: 'HER2 [Mass/volume] in Serum by Immunoassay',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
  {
    category: '',
    cancerType: '',
    code: '85318-4',
    display: 'HER2 [Presence] in Breast cancer specimen by FISH',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
  {
    category: '',
    cancerType: '',
    code: '18474-7',
    display: 'HER2 Ag [Presence] in Tissue by Immune stain',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
  {
    category: '',
    cancerType: '',
    code: '32996-1',
    display: 'HER2 [Mass/volume] in Serum',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
  {
    category: '',
    cancerType: '',
    code: '48676-1',
    display: 'HER2 [Interpretation] in Tissue',
    entryType: 'biomarker',
    codingSystem: 'SNOMED',
  },
];

describe('compareByProperty', () => {
  const sortedJSON = unSortedJSONArray.sort(compareByProperty('display'));
  it("Sort JSON Array by 'display' property", () => {
    expect(sortedJSON).toEqual(expectSortedJSONArray);
  });
});
