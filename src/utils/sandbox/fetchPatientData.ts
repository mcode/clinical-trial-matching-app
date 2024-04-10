import {
  MCODE_CANCER_RELATED_MEDICATION_STATEMENT,
  MCODE_CANCER_RELATED_RADIATION_PROCEDURE,
  MCODE_CANCER_RELATED_SURGICAL_PROCEDURE,
  MCODE_ECOG_PERFORMANCE_STATUS,
  MCODE_KARNOFSKY_PERFORMANCE_STATUS,
  MCODE_PRIMARY_CANCER_CONDITION,
  MCODE_SECONDARY_CANCER_CONDITION,
  MCODE_TUMOR_MARKER,
} from '@/utils/fhirConstants';
import {
  convertFhirEcogPerformanceStatus,
  convertFhirKarnofskyPerformanceStatus,
  convertFhirMedicationStatements,
  convertFhirPatient,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  convertFhirTumorMarkers,
  convertFhirUser,
  extractPrimaryCancerCondition,
} from '@/utils/fhirConversionUtils';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';
import type { PatientData, ProgressMonitor } from '../fetchPatientData';
import { fetchBundleEntries, resourceHasProfile } from '../fhir/fetch';
import { BundleEntry, Observation } from 'fhir/r4';

type FetchTaskType = [
  fhirclient.FHIR.Patient,
  fhirclient.FHIR.Patient | fhirclient.FHIR.Practitioner | fhirclient.FHIR.RelatedPerson,
  fhirclient.FHIR.Bundle,
  fhirclient.FHIR.Bundle,
  BundleEntry<Observation>[],
  fhirclient.FHIR.Bundle,
  fhirclient.FHIR.Bundle,
  fhirclient.FHIR.Bundle
];

// A bug in typescript prevents mapping tuples directly, so the MakePromises
// generic type is required.
type MakePromises<T> = { [K in keyof T]: Promise<T[K]> };

type FetchTaskPromiseType = MakePromises<FetchTaskType>;

export const fetchPatientData = async (fhirClient: Client, progress: ProgressMonitor): Promise<PatientData> => {
  const getResource = bundleMaker(fhirClient);
  const getCondition = getResource('Condition');
  const getProcedure = getResource('Procedure');
  const getMedicationStatement = getResource('MedicationStatement');

  const tasks: FetchTaskPromiseType = [
    fhirClient.patient.read(),
    fhirClient.user.read(),
    getCondition(MCODE_PRIMARY_CANCER_CONDITION),
    getCondition(MCODE_SECONDARY_CANCER_CONDITION),
    fetchBundleEntries<Observation>(fhirClient, 'Observation'),
    getProcedure(MCODE_CANCER_RELATED_RADIATION_PROCEDURE),
    getProcedure(MCODE_CANCER_RELATED_SURGICAL_PROCEDURE),
    getMedicationStatement(MCODE_CANCER_RELATED_MEDICATION_STATEMENT),
  ];
  progress('Fetching patient data...', 0, tasks.length);

  const [
    fhirPatient,
    fhirUser,
    fhirPrimaryCancerCondition,
    fhirSecondaryCancerCondition,
    observationEntries,
    fhirRadiationProcedures,
    fhirSurgeryProcedures,
    fhirMedicationStatements,
  ] = await Promise.all(tasks.map(promise =>
    promise.then(result => {
      progress(1);
      return result;
    })
  )) as FetchTaskType;

  const observations = observationEntries.map((entry) => entry.resource).filter((resource) => typeof resource === 'object' && resource !== null);
  // TODO: Should find the most recent
  // TODO: As this gets more complicated, it'll make more sense to go through all observations and check each one to see
  // if it contains relavent information rather than do separate find/filters
  const ecogObservation = observations.find((resource) => resourceHasProfile(resource, MCODE_ECOG_PERFORMANCE_STATUS));
  const karnosfkyObservation = observations.find((resource) => resourceHasProfile(resource, MCODE_KARNOFSKY_PERFORMANCE_STATUS));
  const biomarkerObservations = observations.filter((resource) => resourceHasProfile(resource, MCODE_TUMOR_MARKER));

  return {
    patient: convertFhirPatient(fhirPatient),
    user: convertFhirUser(fhirUser),
    primaryCancerCondition: extractPrimaryCancerCondition(fhirPrimaryCancerCondition),
    metastasis: convertFhirSecondaryCancerConditions(fhirSecondaryCancerCondition),
    ecogScore: ecogObservation ? convertFhirEcogPerformanceStatus(ecogObservation) : null,
    karnofskyScore: karnosfkyObservation ? convertFhirKarnofskyPerformanceStatus(karnosfkyObservation) : null,
    biomarkers: convertFhirTumorMarkers(biomarkerObservations),
    radiation: convertFhirRadiationProcedures(fhirRadiationProcedures),
    surgery: convertFhirSurgeryProcedures(fhirSurgeryProcedures),
    medications: convertFhirMedicationStatements(fhirMedicationStatements),
  };
};

export default fetchPatientData;

const bundleMaker = (fhirClient: Client) => {
  const urlPatientId = encodeURIComponent(fhirClient.getPatientId());
  return (resourceType: string) =>
    (url: string): Promise<fhirclient.FHIR.Bundle> =>
      fhirClient.request<fhirclient.FHIR.Bundle>(
        `${resourceType}?patient=${urlPatientId}&_profile=${encodeURIComponent(url)}`
      );
};
