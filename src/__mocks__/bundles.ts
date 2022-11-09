import { fhirclient } from 'fhirclient/lib/types';

const NO_SUCH_URL = '';

export const fhirEmptyBundle: fhirclient.FHIR.Bundle = { resourceType: 'Bundle', type: 'searchset', link: [] };

export const fhirKarnofskyPerformanceStatusBundle: fhirclient.FHIR.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '89243-0',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
        valueInteger: 100,
        interpretation: [
          {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA29175-9',
                display: 'Normal; no complaints; no evidence of disease',
              },
            ],
          },
        ],
      },
    },
  ],
  link: [],
};

export const fhirEcogPerformanceStatusBundle: fhirclient.FHIR.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '89247-1',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
        valueInteger: 1,
        interpretation: [
          {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA9623-5',
                display:
                  'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work',
              },
            ],
          },
        ],
      },
    },
  ],
  link: [],
};

export const fhirPrimaryCancerConditionBundle: fhirclient.FHIR.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Condition',
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
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '408643008',
              display: 'Infiltrating duct carcinoma of breast (disorder)',
            },
          ],
        },
        bodySite: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '76752008',
                display: 'Breast structure (body structure)',
              },
            ],
          },
        ],
        subject: {
          reference: 'Patient/patient-123',
        },
        stage: [
          {
            summary: {
              coding: [
                {
                  system: 'http://cancerstaging.org',
                  code: '4',
                  display: 'IV',
                },
              ],
            },
          },
        ],
      },
    },
  ],
  link: [],
};

export const fhirPrimaryCancerConditionBundle2: fhirclient.FHIR.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Condition',
        category: [
          { coding: [{ system: 'http://snomed.info/sct', code: '64572001', display: 'Disease (disorder)' }] },
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'encounter-diagnosis',
                display: 'Encounter Diagnosis',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://snomed.info/sct', code: '254837009', display: 'Malignant neoplasm of breast (disorder)' },
          ],
          text: 'Malignant neoplasm of breast (disorder)',
        },
        subject: { reference: 'Patient/patient-123' },
        stage: [
          {
            summary: {
              coding: [
                { system: 'http://snomed.info/sct', code: '261614003', display: 'Stage 2A (qualifier value)' },
                { system: 'http://cancerstaging.org', code: 'c2A' },
              ],
              text: 'Stage 2A (qualifier value)',
            },
            type: {
              coding: [
                { system: 'http://snomed.info/sct', code: '260998006', display: 'Clinical staging (qualifier value)' },
              ],
            },
          },
          {
            summary: {
              coding: [
                { system: 'http://snomed.info/sct', code: '258219007', display: 'Stage 2 (qualifier value)' },
                { system: 'http://cancerstaging.org', code: 'c2' },
              ],
              text: 'Stage 2 (qualifier value)',
            },
            type: {
              coding: [
                { system: 'http://snomed.info/sct', code: '260998006', display: 'Clinical staging (qualifier value)' },
              ],
            },
          },
        ],
      },
    },
  ],
  link: [],
};

export const fhirSecondaryCancerConditionBundle: fhirclient.FHIR.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Condition',
        extension: [{ url: 'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-related-primary-cancer-condition' }],
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
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '94222008',
              display: 'Secondary malignant neoplasm of bone (disorder)',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
      },
    },
  ],
  link: [],
};

export const fhirMedicationStatementBundle: fhirclient.FHIR.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'MedicationStatement',
        status: 'completed',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1163443',
              display: 'leuprolide Injetable Product',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
        effectiveDateTime: '2019-04-01',
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'MedicationStatement',
        status: 'completed',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1156671',
              display: 'fulvestrant Injectable Product',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'MedicationStatement',
        status: 'active',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1946828',
              display: 'abemaciclib Oral Product',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'MedicationStatement',
        status: 'active',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1156671',
              display: 'fulvestrant Injectable Product',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'MedicationStatement',
        status: 'active',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1873980',
              display: 'ribociclib Oral Product',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
      },
    },
  ],
  link: [],
};

export const fhirRadiationProcedureBundle: fhirclient.FHIR.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-04T01:44:51-04:00', end: '1993-08-04T02:16:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-05T03:44:51-04:00', end: '1993-08-05T04:16:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-06T14:44:51-04:00', end: '1993-08-06T15:12:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-07T22:44:51-04:00', end: '1993-08-07T23:13:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-09T01:44:51-04:00', end: '1993-08-09T02:23:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-10T07:44:51-04:00', end: '1993-08-10T08:13:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-11T11:44:51-04:00', end: '1993-08-11T12:14:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-12T16:44:51-04:00', end: '1993-08-12T17:19:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-14T00:44:51-04:00', end: '1993-08-14T01:23:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '448385000',
              display: 'Megavoltage radiation therapy using photons (procedure)',
            },
          ],
          text: 'Teleradiotherapy procedure (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-08-15T02:44:51-04:00', end: '1993-08-15T03:12:51-04:00' },
      },
    },
  ],
  link: [],
};

export const fhirPatient: fhirclient.FHIR.Patient = {
  resourceType: 'Patient',
  id: 'patient-123',
  identifier: [
    {
      system: 'http://hospital.example.org',
      value: 'a123',
    },
  ],
  name: [
    {
      family: 'Uhura',
      given: ['Nyota'],
    },
  ],
  gender: 'female',
  birthDate: '1959-01-01',
  address: [{ postalCode: '11111' }],
};

export const fhirTumorMarkerBundle: fhirclient.FHIR.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
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
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '40556-3',
              display: 'Estrogen receptor Ag [Presence] in Tissue by Immune stain',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '10828004',
              display: 'Positive (qualifier value)',
            },
          ],
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
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
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '40556-3',
              display: 'Estrogen receptor Ag [Presence] in Tissue by Immune stain',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '10828004',
              display: 'Positive (qualifier value)',
            },
          ],
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
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
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '40557-1',
              display: 'Progesterone receptor Ag [Presence] in Tissue by Immune stain',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '10828004',
              display: 'Positive (qualifier value)',
            },
          ],
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
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
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '18474-7',
              display: 'HER2 Ag [Presence] in Tissue by Immune stain',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '260385009',
              display: 'Negative (qualifier value)',
            },
          ],
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
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
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '62862-8',
              display: 'Microsatellite instability [Presence] in Tissue by Immune stain',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-123',
        },
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '10828004',
              display: 'Positive (qualifier value)',
            },
          ],
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'laboratory',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '48676-1', display: 'HER2 [Interpretation] in Tissue' },
            {
              system: 'http://loinc.org',
              code: '85319-2',
              display: 'HER2 [Presence] in Breast cancer specimen by Immune stain',
            },
          ],
          text: 'HER2 Receptor',
        },
        subject: { reference: 'Patient/patient-123' },
        valueCodeableConcept: {
          coding: [{ system: 'http://snomed.info/sct', code: '260385009', display: 'Negative (qualifier value)' }],
          text: 'Negative (qualifier value)',
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'laboratory',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '48676-1', display: 'HER2 [Interpretation] in Tissue' },
            {
              system: 'http://loinc.org',
              code: '85318-4',
              display: 'HER2 [Presence] in Breast cancer specimen by FISH',
            },
          ],
          text: 'HER2 Receptor',
        },
        valueCodeableConcept: {
          coding: [{ system: 'http://snomed.info/sct', code: '260385009', display: 'Negative (qualifier value)' }],
          text: 'Negative (qualifier value)',
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'laboratory',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '16112-5', display: 'Estrogen receptor [Interpretation] in Tissue' },
            {
              system: 'http://loinc.org',
              code: '85337-4',
              display: 'Estrogen receptor Ag [Presence] in Breast cancer specimen by Immune stain',
            },
          ],
          text: 'Estrogen Receptor',
        },
        valueCodeableConcept: {
          coding: [{ system: 'http://snomed.info/sct', code: '10828004', display: 'Positive (qualifier value)' }],
          text: 'Positive (qualifier value)',
        },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'laboratory',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '16113-3',
              display: 'Progesterone receptor [Interpretation] in Tissue',
            },
            {
              system: 'http://loinc.org',
              code: '85339-0',
              display: 'Progesterone receptor Ag [Presence] in Breast cancer specimen by Immune stain',
            },
          ],
          text: 'Progesterone Receptor',
        },
        valueCodeableConcept: {
          coding: [{ system: 'http://snomed.info/sct', code: '10828004', display: 'Positive (qualifier value)' }],
          text: 'Positive (qualifier value)',
        },
      },
    },
  ],
  link: [],
};

export const fhirSurgeryProcedureBundle: fhirclient.FHIR.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            { system: 'http://snomed.info/sct', code: '64368001', display: 'Partial mastectomy (procedure)' },
            { system: 'http://snomed.info/sct', code: '392021009', display: 'Lumpectomy of breast (procedure)' },
          ],
          text: 'Lumpectomy of breast (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '1993-07-26T01:44:51-04:00', end: '1993-07-26T02:10:51-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '234262008',
              display: 'Excision of axillary lymph node (procedure)',
            },
          ],
          text: 'Excision of axillary lymph node (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '2017-06-01T05:55:14-04:00', end: '2017-06-01T06:43:14-04:00' },
      },
    },
    {
      fullUrl: NO_SUCH_URL,
      resource: {
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            { system: 'http://snomed.info/sct', code: '69031006', display: 'Excision of breast tissue (procedure)' },
          ],
          text: 'Excision of breast tissue (procedure)',
        },
        subject: { reference: 'Patient/patient-123' },
        performedPeriod: { start: '2017-06-01T05:55:14-04:00', end: '2017-06-01T07:55:14-04:00' },
      },
    },
  ],
  link: [],
};
