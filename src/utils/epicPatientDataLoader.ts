import { Encounter } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';

/**
 * This assumes that all of the encounters are in order by date.
 */
export const getMostRecentPerformanceValue = async (
  fhirClient: Client,
  encounters: Encounter[],
  code: string
): Promise<fhirclient.FHIR.Resource | undefined> => {
  for (let i = 0; i < encounters.length; i++) {
    const encounter = encounters[i];
    const observations = await fhirClient.request<fhirclient.FHIR.Bundle>(
      `Observation?patient=${fhirClient.getPatientId()}&category=smartdata&focus=${encounter.id}`
    );
    if (Array.isArray(observations.entry)) {
      console.log(`Encounter SDES ${encounter.id} ${observations.entry.length}`);
      const found = observations.entry.find(
        entry => entry.resource.resourceType === 'Observation' && entry.resource.code?.coding.some(c => c.code === code)
      );
      if (found) {
        return found.resource;
      }
    }
  }
  return undefined;
};
