import type { Bundle, Patient } from 'fhir/r4';
import { SearchParameters } from 'types/search-types';
import { buildBundle } from '../clinical-trial-search';
const cancerType = {
  entryType: 'Primary malignant neoplasm of lung (disorder)',
  display: 'Primary malignant neoplasm of lung (disorder)',
  code: '254632001',
  system: 'http://snomed.info/sct',
};
const cancerSubType = {
  entryType: 'Adenocarcinoma of lung (disorder)',
  display: 'Large cell carcinoma of lung, TNM stage 2 (disorder)',
  code: '423050000',
  system: 'http://snomed.info/sct',
};

export const searchParameters: SearchParameters = {
  age: '28',
  gender: 'female',
  travelDistance: '100',
  zipcode: '75001',
  matchingServices: ['Lungevity'],
  cancerType: JSON.stringify(cancerType),
  cancerSubtype: JSON.stringify(cancerSubType),
  diseaseStatus: JSON.stringify({
    code: '268910001',
    system: 'http://snomed.info/sct',
    display: "Patient's condition improved (finding)",
  }),
  primaryTumorStage: JSON.stringify({
      "entryType": "primaryTumorStage",
      "code": "1222604002",
      "system": "http://snomed.info/sct",
      "display": "cTX (qualifier value)",
      "category": ["cT category"]
  }),
  nodalDiseaseStage: JSON.stringify({
    "entryType": "nodalDiseaseStage",
    "code": "1229966003",
    "system": "http://snomed.info/sct",
    "display": "cNX",
    "category": ["cN category"]
  }),
  metastasesStage: JSON.stringify({
      entryType: "metastasesStage",
      code: "1229901006",
      system: "http://snomed.info/sct",
      display: "cM0",
      category: ["cM category"]
  }),
  metastasis: '["metastasis-1"]',
  ecogScore: JSON.stringify({
    interpretation: {
      code: 'LA9622-7',
      display: 'Fully active, able to carry on all pre-disease performance without restriction',
      system: 'http://loinc.org',
    },
    valueInteger: 0,
  }),
  karnofskyScore: JSON.stringify({
    interpretation: {
      display: 'Normal activity with effort; some signs or symptoms of disease',
      code: 'LA29177-5',
      system: 'http://loinc.org',
    },
    valueInteger: 80,
  }),
  biomarkers: JSON.stringify([
    {
      entryType: 'lung',
      display: 'Estrogen receptor fluorescence intensity [Type] in Breast cancer specimen by Immune stain',
      code: '85310-1',
      system: 'http://snomed.info/sct',
      qualifier: { system: 'http://snomed.info/sct', code: '10828004', display: 'Positive (qualifier value)' },
    },
  ]),
  stage: JSON.stringify({
    code: '258215001',
    display: 'Stage 1 (qualifier value)',
    system: 'http://snomed.info/sct',
  }),
  medications: JSON.stringify([
    {
      entryType: 'lung',
      display: '10 ML ramucirumab 10 MG/ML Injection',
      code: '1657775',
      system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
    },
  ]),
  radiation: JSON.stringify([
    {
      entryType: 'lung',
      display: '2.4 ML Imfinzi 50 MG/ML Injection',
      code: '343330305',
      system: 'http://snomed.info/sct',
    },
  ]),
  surgery: JSON.stringify([
    {
      entryType: 'lung',
      display: 'Excision of middle lobe of right lung (procedure)',
      code: '1919512',
      system: 'http://snomed.info/sct',
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
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-patient'],
        },
        id: 'test_id',
        gender: 'female',
        // Age is 28, test sets time to 2022, 2022-28 = 1994
        birthDate: '1994',
      },
      fullUrl: 'urn:uuid:test_id',
    },
    // Result from getPrimaryCancerCondition
    {
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-primary-cancer-condition'],
        },
        subject: {
          reference: 'urn:uuid:test_id',
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
        // Result from getHistologyMorphologyBehavior
        extension: [
          {
            url: 'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-histology-morphology-behavior',
            valueCodeableConcept: {
              coding: [
                {
                  code: '423050000',
                  display: 'Large cell carcinoma of lung, TNM stage 2 (disorder)',
                  system: 'http://snomed.info/sct',
                },
              ],
              //text: 'Large cell carcinoma of lung, TNM stage 2 (disorder)',
            },
          },
        ],
        category: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '64572001',
              },
            ],
          },
        ],
      },
    },
    // Result from getEcogPerformanceStatus
    {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        subject: {
          reference: 'urn:uuid:test_id',
          type: 'Patient',
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA9622-7',
                display: 'Fully active, able to carry on all pre-disease performance without restriction',
              },
            ],
          },
        ],
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-ecog-performance-status'],
        },
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '89247-1',
            },
          ],
        },
        category: [
          {
            coding: [
              {
                code: 'clinical-test',
                system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-observation-category',
              },
            ],
          },
          {
            coding: [
              {
                code: 'survey',
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              },
            ],
          },
        ],
        valueInteger: 0,
      },
    },
    // Result from getDiseaseStatus
    {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        subject: {
          reference: 'urn:uuid:test_id',
          type: 'Patient',
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-disease-status'],
        },
        code: {
          coding: [
            {
              code: '97509-4',
              system: 'http://loinc.org',
            },
          ],
        },
        valueCodeableConcept: {
          coding: [
            {
              code: '268910001',
              system: 'http://snomed.info/sct',
              display: "Patient's condition improved (finding)",
            },
          ],
        },
      },
    },
    // Result from getKarnofskyPerformanceStatus
    {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        subject: {
          reference: 'urn:uuid:test_id',
          type: 'Patient',
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA29177-5',
                display: 'Normal activity with effort; some signs or symptoms of disease',
              },
            ],
          },
        ],
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-karnofsky-performance-status'],
        },
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '89243-0',
            },
          ],
        },
        category: [
          {
            coding: [
              {
                code: 'clinical-test',
                system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-observation-category',
              },
            ],
          },
          {
            coding: [
              {
                code: 'survey',
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              },
            ],
          },
        ],
        valueInteger: 80,
      },
    },
    // Result from getClinicalStageGroup
    {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        subject: {
          reference: 'urn:uuid:test_id',
          type: 'Patient',
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tnm-clinical-stage-group'],
        },
        code: {
          coding: [
            {
              code: '21908-9',
              system: 'http://snomed.info/sct',
            },
          ],
        },
        valueCodeableConcept: {
          coding: [
            {
              code: '258215001',
              system: 'http://snomed.info/sct',
              display: 'Stage 1 (qualifier value)',
            },
          ],
        },
      },
    },
    // Result from getTumorMarker (biomarker)
    {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        subject: {
          reference: 'urn:uuid:test_id',
          type: 'Patient',
        },
        valueCodeableConcept: {
          coding: [
            {
              code: '10828004',
              display: 'Positive (qualifier value)',
              system: 'http://snomed.info/sct',
            },
          ],
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tumor-marker'],
        },
        code: {
          coding: [
            {
              code: '85310-1',
              display: 'Estrogen receptor fluorescence intensity [Type] in Breast cancer specimen by Immune stain',
              system: 'http://snomed.info/sct',
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
              },
            ],
          },
        ],
      },
    },
    // Result from getCancerRelatedMedicationStatement
    {
      resource: {
        resourceType: 'MedicationStatement',
        subject: {
          reference: 'urn:uuid:test_id',
          type: 'Patient',
        },
        status: 'completed',
        // This time comes from the mocked time below
        effectiveDateTime: '2022-01-01T12:00:00.000Z',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
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
    // TODO: metastases (result from getSecondaryCancerCondition)
    // Result from getCancerRelatedRadiationProcedure
    {
      resource: {
        resourceType: 'Procedure',
        subject: {
          reference: 'urn:uuid:test_id',
          type: 'Patient',
        },
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '343330305',
              display: '2.4 ML Imfinzi 50 MG/ML Injection',
            },
          ],
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-radiation-procedure'],
        },
        performedDateTime: '2022-01-01T12:00:00.000Z',
      },
    },
    // Result from getCancerRelatedSurgicalProcedure
    {
      resource: {
        resourceType: 'Procedure',
        subject: {
          reference: 'urn:uuid:test_id',
          type: 'Patient',
        },
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '1919512',
              display: 'Excision of middle lobe of right lung (procedure)',
            },
          ],
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-surgical-procedure'],
        },
        performedDateTime: '2022-01-01T12:00:00.000Z',
      },
    },
  ],
};

describe('buildBundle', () => {
  // Need to mock the current time to ensure the age is generated properly
  jest.useFakeTimers().setSystemTime(Date.UTC(2022, 0, 1, 12, 0, 0));
  it('builds the expected bundle', () => {
    const patientBundle = buildBundle(searchParameters, 'test_id');
    expect(patientBundle).toEqual(expectedBundle);
  });

  it('caps age at 90', () => {
    const patientBundle = buildBundle({
      age: '92',
      matchingServices: [],
      zipcode: '',
      travelDistance: '',
      gender: '',
      cancerType: 'null',
      cancerSubtype: 'null',
      diseaseStatus: 'null',
      metastasis: '[]',
      stage: '',
      primaryTumorStage: '',
      nodalDiseaseStage: '',
      metastasesStage: '',
      ecogScore: '',
      karnofskyScore: '',
      biomarkers: '[]',
      surgery: '[]',
      medications: '[]',
      radiation: '[]',
    });
    const patient = patientBundle.entry.find(resource => resource.resource?.resourceType == 'Patient');
    expect(patient).toBeDefined();
    expect((patient.resource as Patient).birthDate).toEqual('1932');
  });
});
