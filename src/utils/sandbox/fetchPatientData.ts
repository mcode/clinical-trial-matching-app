import { MCODE_ECOG_PERFORMANCE_STATUS, MCODE_KARNOFSKY_PERFORMANCE_STATUS } from '@/utils/fhirConstants';
import {
  convertFhirEcogPerformanceStatus,
  convertFhirKarnofskyPerformanceStatus,
  convertFhirPatient,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  convertFhirTumorMarkers,
  convertFhirUser,
  extractMedicationCodes,
  extractPrimaryCancerCondition,
} from '@/utils/fhirConversionUtils';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';
import type { PatientData, ProgressMonitor } from '../fetchPatientData';
import { fetchMedications, fetchResources, resourceHasProfile } from '../fhir/fetch';
import { Condition, Medication, Observation, Procedure } from 'fhir/r4';

type FetchTaskType = [
  fhirclient.FHIR.Patient,
  fhirclient.FHIR.Patient | fhirclient.FHIR.Practitioner | fhirclient.FHIR.RelatedPerson,
  Condition[],
  Observation[],
  Procedure[],
  Medication[]
];

// A bug in typescript prevents mapping tuples directly, so the MakePromises
// generic type is required.
type MakePromises<T> = { [K in keyof T]: Promise<T[K]> };

type FetchTaskPromiseType = MakePromises<FetchTaskType>;

export const fetchPatientData = async (fhirClient: Client, progress: ProgressMonitor): Promise<PatientData> => {
  const tasks: FetchTaskPromiseType = [
    fhirClient.patient.read(),
    fhirClient.user.read(),
    fetchResources<Condition>(fhirClient, 'Condition'),
    fetchResources<Observation>(fhirClient, 'Observation'),
    fetchResources<Procedure>(fhirClient, 'Procedure'),
    fetchMedications(fhirClient),
  ];
  progress('Fetching patient data...', 0, tasks.length);

  const [fhirPatient, fhirUser, conditions, observations, procedures, medications] = (await Promise.all(
    tasks.map(promise =>
      promise.then(result => {
        progress(1);
        return result;
      })
    )
  )) as FetchTaskType;

  // TODO: Should find the most recent
  // TODO: As this gets more complicated, it'll make more sense to go through all observations and check each one to see
  // if it contains relavent information rather than do separate find/filters
  // FIXME: ECOG and Karnofsy have no associated records, so the following will never work but needs to be changed to
  // not be using the profile anyway
  const ecogObservation = observations.find(resource => resourceHasProfile(resource, MCODE_ECOG_PERFORMANCE_STATUS));
  const karnosfkyObservation = observations.find(resource =>
    resourceHasProfile(resource, MCODE_KARNOFSKY_PERFORMANCE_STATUS)
  );

  return {
    patient: convertFhirPatient(fhirPatient),
    user: convertFhirUser(fhirUser),
    primaryCancerCondition: extractPrimaryCancerCondition(conditions),
    metastasis: convertFhirSecondaryCancerConditions(conditions),
    ecogScore: ecogObservation ? convertFhirEcogPerformanceStatus(ecogObservation) : null,
    karnofskyScore: karnosfkyObservation ? convertFhirKarnofskyPerformanceStatus(karnosfkyObservation) : null,
    biomarkers: convertFhirTumorMarkers(observations),
    radiation: convertFhirRadiationProcedures(procedures),
    surgery: convertFhirSurgeryProcedures(procedures),
    medications: extractMedicationCodes(medications),
  };
};

export default fetchPatientData;
