/**
 * Base code for loading patient data.
 */

import { Condition, Encounter, Medication, MedicationRequest, Observation, Procedure } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';

function extractEntries<T extends { resourceType: string }>(
  bundle: fhirclient.FHIR.Bundle,
  resourceType: T['resourceType']
): T[] {
  if (!Array.isArray(bundle.entry)) {
    // Nothing returned (or it can't be understood)? Return an empty list.
    return [];
  }
  return bundle.entry.filter(entry => entry.resource.resourceType == resourceType).map(entry => entry.resource) as T[];
}

export const getAllProcedures = async (fhirClient: Client): Promise<Procedure[]> => {
  return extractEntries(
    await fhirClient.request<fhirclient.FHIR.Bundle>(`Procedure?patient=${fhirClient.getPatientId()}`),
    'Procedure'
  );
};

export const getAllConditions = async (fhirClient: Client): Promise<Condition[]> => {
  return extractEntries(
    await fhirClient.request<fhirclient.FHIR.Bundle>(`Condition?patient=${fhirClient.getPatientId()}`),
    'Condition'
  );
};

export const getAllObservations = async (fhirClient: Client): Promise<Observation[]> => {
  return extractEntries(
    await fhirClient.request<fhirclient.FHIR.Bundle>(
      `Observation?patient=${fhirClient.getPatientId()}&category=laboratory`
    ),
    'Observation'
  );
};

const getAllMedicationRequests = async (fhirClient: Client): Promise<MedicationRequest[]> => {
  return extractEntries(
    await fhirClient.request<fhirclient.FHIR.Bundle>(`MedicationRequest?patient=${fhirClient.getPatientId()}`),
    'MedicationRequest'
  );
};

/**
 * Retrieves all known medications.
 * @param fhirClient the client to retrieve medications from
 */
export const getAllMedications = async (fhirClient: Client): Promise<Medication[]> => {
  const medications: Promise<Medication>[] = [];
  const medicationRequests = await getAllMedicationRequests(fhirClient);
  for (const medRequest of medicationRequests) {
    // See if this requires the medication be loaded separately
    if (medRequest.medicationReference && medRequest.medicationReference.reference) {
      // It does, so add the request
      medications.push(fhirClient.request<Medication>(medRequest.medicationReference.reference));
    } else if (medRequest.medicationCodeableConcept) {
      // Has the medication embedded
      medications.push(
        Promise.resolve({
          resourceType: 'Medication',
          code: medRequest.medicationCodeableConcept,
        })
      );
    }
  }
  return Promise.all(medications);
};

export const getAllEncounters = async (fhirClient: Client): Promise<Encounter[]> => {
  return extractEntries(
    await fhirClient.request<fhirclient.FHIR.Bundle>(`Encounter?patient=${fhirClient.getPatientId()}`),
    'Encounter'
  );
};

/**
 * Searches patient records.
 * @param fhirClient the FHIR client
 * @param recordType the record type to search
 * @param query the query to run
 * @returns a Promise of a Bundle containing the results
 */
const searchRecords = (fhirClient: Client, recordType: string, query?: Record<string, string>) => {
  let urlEncodedQuery = '';
  if (typeof query === 'object') {
    for (const key in query) {
      // Always add &, this is always appended to an existing query
      urlEncodedQuery += `&${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`;
    }
  }
  return fhirClient.request<fhirclient.FHIR.Bundle>(
    `${recordType}?patient=${fhirClient.getPatientId()}${urlEncodedQuery}`
  );
};

/**
 * Debug function for dumping patient data, so that we can see what it looks like.
 */
export const debugDumpRecords = async (fhirClient: Client): Promise<void> => {
  const recordTypes = {
    Condition: {
      category: ['encounter-diagnosis', 'genomics', 'health-concer', 'infection', 'medical-history'],
    },
    Encounter: true,
    Observation: {
      category: ['core-characteristics', 'genomics', 'laboratory', 'smartdata'],
    },
    Procedure: {
      category: ['103693007', '387713003'],
    },
  };

  // Ensure that the patient is available
  await fhirClient.patient.read();
  for (const resourceType in recordTypes) {
    const query = recordTypes[resourceType];
    // for now, just do each parameter individually
    if (query === true) {
      // no specific parameters
      console.log(`---- ${resourceType} ----`);
      console.log(JSON.stringify(await searchRecords(fhirClient, resourceType), null, 2));
    } else {
      console.log(`---- ${resourceType} ----`);
      for (const key in query) {
        const values = query[key];
        if (Array.isArray(values)) {
          for (const value of values) {
            console.log(`  -- ${key}=${value} --`);
            console.log(JSON.stringify(await searchRecords(fhirClient, resourceType, { [key]: value }), null, 2));
          }
        } else if (typeof values === 'string') {
          // just run this single value
          console.log(`  -- ${key}=${values} --`);
          console.log(JSON.stringify(await searchRecords(fhirClient, resourceType, { [key]: values }), null, 2));
        }
      }
    }
  }
};
