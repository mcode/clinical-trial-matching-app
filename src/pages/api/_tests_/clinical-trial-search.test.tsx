import { Patient } from 'types/fhir-types';
const patient: Patient = {
  resourceType: 'Patient',
  id: 'search_patient',
};
export const SearchParameters = {
  age: '28',
  gender: 'male',
  travelDistance: '100',
  zipcode: '11111',
  matchingServices: 'Lungevity',
  cancerType: {
    entryType: 'Primary malignant neoplasm of lung (disorder)',
    display: 'Primary malignant neoplasm of lung (disorder)',
    code: '372137005',
  },
  cancerSubtype: {
    entryType: 'Adenocarcinoma of lung (disorder)',
    display: 'Adenocarcinoma of lung (disorder)',
    code: '3721370305',
  },
  metastasis: 'metastasis1',
  ecogScore: '3',
  karnofskyScore: '10',
  biomarkers: { entryType: 'lung', display: 'HER2 panel - tissue by fish', code: '343721370305' },
  stage: { entryType: 'lung', display: 'Stage 1', code: '3430305' },
  medication: { entryType: 'lung', display: '10 ML ramucirumab 10 MG/ML Injection', code: '1657775' },
  radiation: { entryType: 'lung', display: 'Tarceva', code: '343330305' },
};

/*
describe('buildBundle', () => {
  it('patient bundle returned', () => {
    const actual = buildBundle(SearchParameters);
    expect(actual.map()).toEqual(idsOfOriginalResults);
  });
});*/
