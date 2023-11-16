import { extractBiomarkerCodes, extractCodes, convertCodesToBiomarkers } from '../encodeODPE';

describe('extractCodes()', () => {
  it('handles an empty array', () => {
    expect(extractCodes([])).toEqual([]);
  });
  it('extracts the codes with qualifiers', () => {
    expect(
      extractCodes([
        {
          entryType: 'metastasis',
          cancerType: ['brain', 'breast', 'colon', 'lung', 'multipleMyeloma', 'prostate'],
          code: '94381002',
          display: 'Secondary malignant neoplasm of liver',
          system: 'http://snomed.info/sct',
          category: ['liver'],
        },
      ])
    ).toEqual(['94381002']);
  });
});

describe('extractBiomakerCodes()', () => {
  it('handles an empty array', () => {
    expect(extractBiomarkerCodes([])).toEqual([]);
  });
  it('extracts the codes with qualifiers', () => {
    expect(
      extractBiomarkerCodes([
        {
          entryType: 'biomarkers',
          cancerType: ['colon'],
          code: '31150-6',
          display: 'ERBB2 gene duplication [Presence] in Tissue by FISH',
          system: 'http://loinc.org',
          category: ['erbb2_her2', 'HER2'],
          qualifier: {
            code: '260385009',
            display: 'Negative (qualifier value)',
            system: 'http://snomed.info/sct',
          },
        },
      ])
    ).toEqual(['260385009:31150-6']);
  });
});

describe('convertCodesToBiomarkers()', () => {
  it('recreates the qualifier', () => {
    expect(convertCodesToBiomarkers(['260385009:31150-6'])).toEqual([
      {
        entryType: 'biomarkers',
        cancerType: ['colon'],
        code: '31150-6',
        display: 'ERBB2 gene duplication [Presence] in Tissue by FISH',
        system: 'http://loinc.org',
        category: ['erbb2_her2', 'HER2'],
        qualifier: {
          code: '260385009',
          display: 'Negative (qualifier value)',
          system: 'http://snomed.info/sct',
        },
      },
    ]);
  });
});
