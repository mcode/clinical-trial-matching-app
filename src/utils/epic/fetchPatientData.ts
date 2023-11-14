import { convertEcogScore, convertKarnofskyScore } from '@/utils/epicEHRConverters';
import {
  convertFhirPatient,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  extractMedicationCodes,
  extractPrimaryCancerCondition,
} from '@/utils/fhirConversionUtils';
import { Medication, MedicationRequest, Observation } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';
import { PatientData, ProgressMonitor, subProgressMonitor } from '../fetchPatientData';

export const fetchPatientData = async (fhirClient: Client, progress: ProgressMonitor): Promise<PatientData> => {
  progress('Fetching patient data', 0, 25);
  const fhirPatient = await fhirClient.patient.read();

  progress('Fetching conditions', 1);
  const conditions = await getAllConditions(fhirClient);
  progress('Fetching proceedures', 1);
  const procedures = await getAllProcedures(fhirClient);
  progress('Fetching encounters', 1);
  const encounters = await getAllEncounters(fhirClient);
  // const observations = await getAllObservations(fhirClient);
  progress('Fetching medications', 1);
  const meds = await getAllMedications(fhirClient);

  progress('Fetching ECOG/Karnofsky scores', 1);
  const fhirEcogPerformanceStatus = await getMostRecentPerformanceValue(
    fhirClient,
    encounters,
    'EPIC#31000083940',
    subProgressMonitor(progress, 10)
  );
  const fhirKarnofskyPerformanceStatus = await getMostRecentPerformanceValue(
    fhirClient,
    encounters,
    'EPIC#1500',
    subProgressMonitor(progress, 10)
  );

  // const

  /*console.log(`  === LOADED DATA ===
-- Conditions --
${JSON.stringify(conditions, null, 2)}

-- Procedures --
${JSON.stringify(procedures, null, 2)}

-- Medications --
${JSON.stringify(meds, null, 2)}

-- Observations --
${JSON.stringify(observations, null, 2)}
`);*/

  const metastasis = convertFhirSecondaryCancerConditions(conditions);
  const primaryCancerCondition = extractPrimaryCancerCondition(conditions);

  const medications = extractMedicationCodes(meds);

  console.log('Primary ', primaryCancerCondition);
  console.log('Secondary ', metastasis);
  console.log('Medications ', medications);

  return {
    patient: convertFhirPatient(fhirPatient),
    primaryCancerCondition: primaryCancerCondition,
    metastasis: metastasis,
    // Conversion is "safe" as convertEcogScore will reject bad values
    ecogScore: convertEcogScore(fhirEcogPerformanceStatus as Observation),
    karnofskyScore: convertKarnofskyScore(fhirKarnofskyPerformanceStatus as Observation),
    // biomarkers: convertFhirTumorMarkers(fhirTumorMarkers),
    biomarkers: [],
    radiation: convertFhirRadiationProcedures(procedures),
    surgery: convertFhirSurgeryProcedures(procedures),
    medications: medications,
  };
};

export default fetchPatientData;

// get conditions
// filter primary cancers
// metastisies
// get Observations
// get procedures
// get medications
// get encounters
// get sde observations
// filter ecog
// filter karnofsky

const getAllProcedures = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`Procedure?patient=${fhirClient.getPatientId()}`);
};

const getAllConditions = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`Condition?patient=${fhirClient.getPatientId()}`);
};

const getAllMedicationRequests = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`MedicationRequest?patient=${fhirClient.getPatientId()}`);
};

/**
 * Retrieves all known medications.
 * @param fhirClient the client to retrieve medications from
 */
const getAllMedications = async (fhirClient: Client): Promise<Medication[]> => {
  const medications: Promise<Medication>[] = [];
  const medicationRequestBundle = await getAllMedicationRequests(fhirClient);
  if (medicationRequestBundle.entry) {
    for (const entry of medicationRequestBundle.entry) {
      if (entry.resource && entry.resource.resourceType === 'MedicationRequest') {
        const medRequest = entry.resource as MedicationRequest;
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
    }
  }
  return Promise.all(medications);
};

const getAllEncounters = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`Encounter?patient=${fhirClient.getPatientId()}`);
};

// This assumes that all of the encounters are in order by date.
const getMostRecentPerformanceValue = async (
  fhirClient: Client,
  encounters: fhirclient.FHIR.Bundle,
  code: string,
  progress: ProgressMonitor
) => {
  progress(0, 0, encounters.entry.length);
  for (let i = 0; i < encounters.entry.length; i++) {
    const encounter = encounters.entry[i];
    const observations = await fhirClient.request<fhirclient.FHIR.Bundle>(
      `Observation?patient=${fhirClient.getPatientId()}&category=smartdata&focus=${encounter.resource.id}`
    );
    progress(1);
    if (Array.isArray(observations.entry)) {
      console.log(`Encounter SDES ${encounter.resource.id} ${observations.entry.length}`);
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
