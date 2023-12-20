import Client from 'fhirclient/lib/Client';
import fetchPatientData from '../fetchPatientData';

describe('fetchPatientData', () => {
  const mockClient: Client = {
    patient: {
      read: async () => ({
        resourceType: 'Patient',
      }),
    },
    getPatientId: () => 'test',
    request: async () => ({
      resourceType: 'Bundle',
    }),
  } as unknown as Client;
  it('loads', async () => {
    // This is currently basically a smoke test that tests to make sure the
    // load function does anything at all.
    // FIXME: Add enough test data to ensure this works as expected
    const patientData = await fetchPatientData(mockClient, jest.fn());
    expect(patientData).toBeDefined();
  });
});
