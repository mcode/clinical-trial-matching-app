import { fetchPatientData, buildPatientData } from '../fetchPatientData';
import { fhirclient } from 'fhirclient/lib/types';
import { createMockFhirClient, createRequestSpy } from '@/__mocks__/fhirClient';

const testPatient: fhirclient.FHIR.Patient = {
  resourceType: 'Patient',
  id: 'test-patient',
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
    // "Configure" test data
    process.env['FHIR_QUERY_CONDITION'] = 'type=condition';
    process.env['FHIR_QUERY_OBSERVATION'] = 'type=observation';
    process.env['FHIR_QUERY_PROCEDURE'] = 'type=procedure';
    process.env['FHIR_QUERY_MEDICATIONREQUEST'] = 'type=medicationrequest';
    // Spy for requests
    const requestSpy = createRequestSpy();
    const fhirClient = createMockFhirClient({ request: requestSpy });
    const patientData = await fetchPatientData(fhirClient, () => {
      /* no-op */
    });
    // Basically, this should be blank
    // It might be worth checking to see if the expected queries were called,
    // but not really
    expect(patientData).toEqual({
      patient: {
        id: 'test-patient',
        name: 'Test User',
        gender: undefined,
        age: null,
        zipcode: null,
      },
      user: {
        id: 'test-patient',
        name: 'Test User',
        record: testPatient,
      },
      primaryCancerCondition: null,
      metastasis: [],
      ecogScore: null,
      karnofskyScore: null,
      biomarkers: [],
      radiation: [],
      surgery: [],
      medications: [],
    });
    expect(requestSpy).toHaveBeenCalledTimes(4);
    expect(requestSpy.mock.calls[0]).toEqual(['Condition?patient=test-patient&type=condition', { pageLimit: 0 }]);
    expect(requestSpy.mock.calls[1]).toEqual(['Observation?patient=test-patient&type=observation', { pageLimit: 0 }]);
    expect(requestSpy.mock.calls[2]).toEqual(['Procedure?patient=test-patient&type=procedure', { pageLimit: 0 }]);
    expect(requestSpy.mock.calls[3]).toEqual([
      'MedicationRequest?patient=test-patient&type=medicationrequest',
      { pageLimit: 0 },
    ]);
  });
});

describe('buildPatientData', () => {
  it('functions with no data read', () => {
    const patientData = buildPatientData([testPatient, testUser, [], [], [], []]);
    expect(typeof patientData).toEqual('object');
    expect(patientData).not.toBeNull();
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
  describe('ECOG and Karnofsky', () => {
    it('loads ECOG Performance Status', () => {
      const patientData = buildPatientData([
        testPatient,
        testUser,
        [],
        [
          {
            resourceType: 'Observation',
            id: 'ecog-performance-status',
            status: 'final',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '89247-1',
                },
              ],
            },
            interpretation: [
              {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: 'LA9622-7',
                  },
                ],
              },
            ],
          },
        ],
        [],
        [],
      ]);
      expect(patientData.ecogScore).not.toBeNull();
      expect(patientData.ecogScore).toEqual({
        interpretation: {
          code: 'LA9622-7',
          display: 'Fully active, able to carry on all pre-disease performance without restriction',
          system: 'http://loinc.org',
        },
        valueInteger: 0,
        entryType: 'ecogScore',
      });
    });
    it('loads Karnofsky Performance Status', () => {
      const patientData = buildPatientData([
        testPatient,
        testUser,
        [],
        [
          {
            resourceType: 'Observation',
            id: 'karnofsky-performance-status',
            status: 'final',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '89243-0',
                },
              ],
            },
            valueInteger: 20,
          },
        ],
        [],
        [],
      ]);
      expect(patientData.karnofskyScore).not.toBeNull();
      expect(patientData.karnofskyScore).toEqual({
        interpretation: {
          display: 'Very sick; hospitalization necessary; active supportive treatment necessary',
          code: 'LA29183-3',
          system: 'http://loinc.org',
        },
        valueInteger: 20,
        entryType: 'karnofskyScore',
      });
    });
  });
});
