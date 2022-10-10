import { sortByProperty } from '../SearchFormOptions';

const expectSortedJSONArray = [
  {
    code: '18474-7',
    display: 'HER2 Ag [Presence] in Tissue by Immune stain',
    entryType: 'biomarker',
  },
  {
    code: '48676-1',
    display: 'HER2 [Interpretation] in Tissue',
    entryType: 'biomarker',
  },
  {
    code: '32996-1',
    display: 'HER2 [Mass/volume] in Serum',
    entryType: 'biomarker',
  },
  {
    code: '42914-2',
    display: 'HER2 [Mass/volume] in Serum by Immunoassay',
    entryType: 'biomarker',
  },
  {
    code: '85318-4',
    display: 'HER2 [Presence] in Breast cancer specimen by FISH',
    entryType: 'biomarker',
  },
];

const unSortedJSONArray = [
  {
    code: '42914-2',
    display: 'HER2 [Mass/volume] in Serum by Immunoassay',
    entryType: 'biomarker',
  },
  {
    code: '85318-4',
    display: 'HER2 [Presence] in Breast cancer specimen by FISH',
    entryType: 'biomarker',
  },
  {
    code: '18474-7',
    display: 'HER2 Ag [Presence] in Tissue by Immune stain',
    entryType: 'biomarker',
  },
  {
    code: '32996-1',
    display: 'HER2 [Mass/volume] in Serum',
    entryType: 'biomarker',
  },
  {
    code: '48676-1',
    display: 'HER2 [Interpretation] in Tissue',
    entryType: 'biomarker',
  },
];

describe('sortByProperty', () => {
  const sortedJSON = sortByProperty(unSortedJSONArray, 'display', 1);
  it("Sort JSON Array by 'display' property", () => {
    expect(sortedJSON).toEqual(expectSortedJSONArray);
  });
});
