import type Client from 'fhirclient/lib/Client';
import type { fhirclient } from 'fhirclient/lib/types';
import type { Bundle } from 'fhir/r4';

/**
 * Test patient used for the mock client
 */
export const DEFAULT_PATIENT: fhirclient.FHIR.Patient = {
  resourceType: 'Patient',
  id: 'test-patient',
  name: [
    {
      given: ['Test'],
      family: 'User',
    },
  ],
};

export const createRequestSpy = () =>
  jest.fn(async (query: string, options?: fhirclient.FhirOptions): Promise<Bundle | Bundle[]> => {
    // For now, always return an empty bundle (or an array of a single empty bundle)
    // At some point this may handle returning mock results
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
  });

/**
 * Creates a new mock FHIR client using the given patient.
 */
export const createMockFhirClient = ({ patient = DEFAULT_PATIENT, request = createRequestSpy() }): Client =>
  ({
    patient: {
      read: () => Promise.resolve(patient),
    },
    user: {
      read: () => Promise.resolve(patient),
    },
    getPatientId: () => patient.id,
    request: request,
  } as unknown as Client);
