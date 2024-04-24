import { Bundle } from 'fhir/r4';
import { fetchPatientData, buildPatientData } from '../fetchPatientData';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';

const testPatient: fhirclient.FHIR.Patient = {
  resourceType: 'Patient',
  name: [
    {
      given: ['Test'],
      family: 'User',
    },
  ],
};

// For now, the test user is always the patient
const testUser = testPatient;

describe('fetchPatientData', () => {
  it('fetches data', async () => {
    // This is a mock client, it's intentionally missing things the real one would have
    const fhirClient = {
      patient: {
        read: () => Promise.resolve(testPatient),
      },
      user: {
        read: () => Promise.resolve(testUser),
      },
      getPatientId: () => 'test-patient',
      request: async (query: string, options?: fhirclient.FhirOptions): Promise<Bundle | Bundle[]> => {
        // For now, always return an empty bundle (or an array of a single empty bundle)
        if ('pageLimit' in options) {
          return [
            {
              resourceType: 'Bundle',
              type: 'searchset',
              entry: [],
            },
          ];
        }
        return {
          resourceType: 'Bundle',
          type: 'searchset',
          entry: [],
        };
      },
    } as unknown as Client;
    const patientData = await fetchPatientData(fhirClient, () => {
      /* no-op */
    });
    expect(patientData).not.toBeNull();
  });
});

describe('buildPatientData', () => {
  it('functions with no data read', () => {
    const patientData = buildPatientData([testPatient, testUser, [], [], [], []]);
    expect(typeof patientData).toEqual('object');
    expect(patientData).not.toBeNull();
  });
  it('finds disease status records', () => {
    const patientData = buildPatientData([
      testPatient,
      testUser,
      [],
      [
        // This is an abridged version of the example cancer disease status from the mCODE IG
        {
          resourceType: 'Observation',
          id: 'cancer-disease-status-improved-brian-l',
          meta: {
            profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-disease-status'],
          },
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '97509-4',
              },
            ],
          },
          subject: {
            reference: 'Patient/cancer-patient-brian-l',
          },
          effectiveDateTime: '2024-02-08',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '268910001',
                display: "Patient's condition improved (finding)",
              },
            ],
          },
        },
      ],
      [],
      [],
    ]);
    expect(patientData.diseaseStatus).not.toBeNull();
    expect(patientData.diseaseStatus.system).toEqual('http://snomed.info/sct');
    expect(patientData.diseaseStatus.code).toEqual('268910001');
  });
  describe('biomarkers', () => {
    it('loads HER2 markers', () => {
      const patientData = buildPatientData([
        testPatient,
        testUser,
        [],
        [
          {
            resourceType: 'Observation',
            status: 'final',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '51981-9',
                  display: 'HER2 [Presence] in Serum by Immunoassay',
                },
              ],
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
          },
        ],
        [],
        [],
      ]);
      expect(patientData).not.toBeNull();
      expect(patientData.biomarkers).toEqual([
        {
          entryType: 'biomarkers',
          cancerType: ['breast', 'lung'],
          code: '51981-9',
          display: 'HER2 [Presence] in Serum by Immunoassay',
          system: 'http://loinc.org',
          category: ['HER2'],
          qualifier: {
            code: '10828004',
            display: 'Positive (qualifier value)',
            system: 'http://snomed.info/sct',
          },
        },
      ]);
    });
  });
});
