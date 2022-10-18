import { Bundle } from 'types/fhir-types';
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
  biomarkers: JSON.stringify({
    entryType: 'lung',
    display: 'Estrogen receptor fluorescence intensity [Type] in Breast cancer specimen by Immune stain',
    code: '85310-1',
  }),
  stage: JSON.stringify({ entryType: 'lung', display: 'Stage 1', code: '3430305' }),
  medications: JSON.stringify({ entryType: 'lung', display: '10 ML ramucirumab 10 MG/ML Injection', code: '1657775' }),
  radiation: JSON.stringify({ entryType: 'lung', display: '2.4 ML Imfinzi 50 MG/ML Injection', code: '343330305' }),
  surgery: JSON.stringify({
    entryType: 'lung',
    display: 'Excision of middle lobe of right lung (procedure)',
    code: '1919512',
  }),
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
            name: 'zipcode',
            valueString: '75001',
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'Patient',
        id: 'search_patient',
        gender: 'female',
        birthDate: '2019',
      },
    },
    {
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-primary-cancer-condition'],
        },
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '254632001',
              display: ' Small cell carcinoma of lung (disorder)',
            },
          ],
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-histology-morphology-behavior',
            valueCodeableConcept: {
              code: '423050000',
              display: 'Large cell carcinoma of lung, TNM stage 2 (disorder)',
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
        status: 'completed',
        subject: {
          id: '0',
          gender: 'other',
          name: 'search_name',
          age: '0',
          zipcode: '00000',
        },
        coding: [
          {
            system: 'https://snomed.info/sct',
            code: '85310-1',
            display: 'Estrogen receptor fluorescence intensity [Type] in Breast cancer specimen by Immune stain',
          },
        ],
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
          id: '0',
          gender: 'other',
          name: 'search_name',
          age: '0',
          zipcode: '00000',
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
        status: 'completed',
        subject: {
          id: '0',
          gender: 'other',
          name: 'search_name',
          age: '0',
          zipcode: '00000',
        },
        coding: [
          {
            system: 'https://snomed.info/sct',
            code: '736974006',
            display: 'Excision of middle lobe of right lung (procedure)',
          },
        ],
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-surgical-procedure'],
        },
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'mcode-cancer-related-radiation-procedure',
        status: 'completed',
        subject: {
          id: '0',
          gender: 'other',
          name: 'search_name',
          age: '0',
          zipcode: '00000',
        },
        coding: [
          {
            system: 'https://snomed.info/sct',
            code: '1919512',
            display: '2.4 ML Imfinzi 50 MG/ML Injection',
          },
        ],
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-radiation-procedure'],
        },
      },
    },
  ],
};

describe('buildBundle', () => {
  const patientBundle = buildBundle(searchParameters);
  it("Sort JSON Array by 'display' property", () => {
    expect(patientBundle).toEqual(expectedBundle);
  });
});
