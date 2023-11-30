// This is a currently unused module intended to help debug importing data from Epic EHR sources.

import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';

export const getAllObservations = (fhirClient: Client): Promise<fhirclient.FHIR.Bundle> => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(
    `Observation?patient=${fhirClient.getPatientId()}&category=laboratory`
  );
};

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

// Debug function for dumping patient data
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
