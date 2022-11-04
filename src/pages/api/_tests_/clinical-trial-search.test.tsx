import type { Bundle } from 'fhir/r4';
import { SearchParameters } from 'types/search-types';
import { buildBundle } from '../clinical-trial-search';
const cancerType = {
  entryType: 'Primary malignant neoplasm of lung (disorder)',
  display: 'Primary malignant neoplasm of lung (disorder)',
  code: '254632001',
};
const cancerSubType = {
  entryType: 'Adenocarcinoma of lung (disorder)',
  display: 'Large cell carcinoma of lung, TNM stage 2 (disorder)',
  code: '423050000',
};

export const searchParameters: SearchParameters = {
  age: '28',
  gender: 'female',
  travelDistance: '100',
  zipcode: '75001',
  matchingServices: ['Lungevity'],
  cancerType: JSON.stringify(cancerType),
  cancerSubtype: JSON.stringify(cancerSubType),
  metastasis: ['metastasis-1'],
  ecogScore: '0',
  karnofskyScore: '80',
  biomarkers: JSON.stringify([
    {
      entryType: 'lung',
      display: 'Estrogen receptor fluorescence intensity [Type] in Breast cancer specimen by Immune stain',
      code: '85310-1',
    },
  ]),
  stage: JSON.stringify({ entryType: 'lung', display: 'Stage 1', code: '3430305' }),
  medications: JSON.stringify([
    { entryType: 'lung', display: '10 ML ramucirumab 10 MG/ML Injection', code: '1657775' },
  ]),
  radiation: JSON.stringify([{ entryType: 'lung', display: '2.4 ML Imfinzi 50 MG/ML Injection', code: '343330305' }]),
  surgery: JSON.stringify([
    {
      entryType: 'lung',
      display: 'Excision of middle lobe of right lung (procedure)',
      code: '1919512',
    },
  ]),
};

const expectedBundle: Bundle = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: [
    {
      resource: {
        resourceType: 'Parameters',
        id: '0',
        parameter: [
          {
            name: 'zipCode',
            valueString: '75001',
          },
          {
            name: 'travelRadius',
            valueString: '100',
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'Patient',
        id: 'search_patient',
        gender: 'female',
        // Age is 28, test sets time to 2022, 2022-28 = 1994
        birthDate: '1994',
      },
      fullUrl: 'urn:uuid:1',
    },
    {
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-primary-cancer-condition'],
        },
        subject: {
          reference: 'urn:uuid:1',
          type: 'Patient',
        },
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '254632001',
              display: 'Primary malignant neoplasm of lung (disorder)',
            },
          ],
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-histology-morphology-behavior',
            valueCodeableConcept: {
              coding: [
                {
                  code: '423050000',
                  display: 'Large cell carcinoma of lung, TNM stage 2 (disorder)',
                },
              ],
              text: 'Large cell carcinoma of lung, TNM stage 2 (disorder)',
            },
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'mcode-ecog-performance-status',
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-ecog-performance-status'],
        },
        status: 'final',
        subject: {
          reference: 'urn:uuid:1',
          type: 'Patient',
        },
        code: {
          coding: [
            {
              system: '',
              code: '89247-1',
            },
          ],
        },
        valueString: '0',
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'mcode-karnofsky-performance-status',
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-karnofsky-performance-status'],
        },
        status: 'final',
        subject: {
          reference: 'urn:uuid:1',
          type: 'Patient',
        },
        code: {
          coding: [
            {
              system: 'https://loinc.org',
              code: 'LL4986-7',
            },
          ],
        },
        valueString: '80',
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'tnm-clinical-distant-metastases-category-cM0',
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/tnm-clinical-distant-metastases-category-cM0'],
        },
        status: 'final',
        subject: {
          reference: 'urn:uuid:1',
          type: 'Patient',
        },
        code: {
          coding: [
            {
              system: 'https://loinc.org',
              code: 'LL4986-7',
            },
          ],
        },
        valueString: 'metastasis-1',
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'mcode-tumor-marker',
        status: 'final',
        subject: {
          reference: 'urn:uuid:1',
          type: 'Patient',
        },
        code: {
          coding: [
            {
              system: 'https://snomed.info/sct',
              code: '85310-1',
              display: 'Estrogen receptor fluorescence intensity [Type] in Breast cancer specimen by Immune stain',
            },
          ],
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tumor-marker'],
        },
      },
    },
    {
      resource: {
        resourceType: 'MedicationStatement',
        id: 'mcode-cancer-related-medication-statement',
        subject: {
          reference: 'urn:uuid:1',
          type: 'Patient',
        },
        status: 'completed',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'https://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1657775',
              display: '10 ML ramucirumab 10 MG/ML Injection',
            },
          ],
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-statement'],
        },
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'mcode-cancer-related-surgical-procedure',
        status: 'final',
        subject: {
          reference: 'urn:uuid:1',
          type: 'Patient',
        },
        code: {
          coding: [
            {
              system: 'https://snomed.info/sct',
              code: '1919512',
              display: 'Excision of middle lobe of right lung (procedure)',
            },
          ],
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-surgical-procedure'],
        },
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'mcode-cancer-related-radiation-procedure',
        status: 'final',
        subject: {
          reference: 'urn:uuid:1',
          type: 'Patient',
        },
        code: {
          coding: [
            {
              system: 'https://snomed.info/sct',
              code: '343330305',
              display: '2.4 ML Imfinzi 50 MG/ML Injection',
            },
          ],
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-radiation-procedure'],
        },
      },
    },
  ],
};

describe('buildBundle', () => {
  // Need to mock the current time to ensure the age is generated properly
  jest.useFakeTimers().setSystemTime(Date.UTC(2022, 0, 1, 12, 0, 0));
  const patientBundle = buildBundle(searchParameters);
  it('builds the expected bundle', () => {
    expect(patientBundle).toEqual(expectedBundle);
  });
});
