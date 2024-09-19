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
});
