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

export const fetchPatientData = async (fhirClient: Client, progress: ProgressMonitor): Promise<PatientData> => {
  const getResource = bundleMaker(fhirClient);
  const getCondition = getResource('Condition');
  const getObservation = getResource('Observation');
  const getProcedure = getResource('Procedure');
  const getMedicationStatement = getResource('MedicationStatement');

  const tasks = [
    fhirClient.patient.read(),
    fhirClient.user.read(),
    getCondition(MCODE_PRIMARY_CANCER_CONDITION),
    getCondition(MCODE_SECONDARY_CANCER_CONDITION),
    getObservation(MCODE_ECOG_PERFORMANCE_STATUS),
    getObservation(MCODE_KARNOFSKY_PERFORMANCE_STATUS),
    getObservation(MCODE_TUMOR_MARKER),
    getProcedure(MCODE_CANCER_RELATED_RADIATION_PROCEDURE),
    getProcedure(MCODE_CANCER_RELATED_SURGICAL_PROCEDURE),
    getMedicationStatement(MCODE_CANCER_RELATED_MEDICATION_STATEMENT),
  ].map(promise =>
    promise.then(result => {
      progress(1);
      return result;
    })
  );
  progress('Fetching patient data...', 0, tasks.length);

  const [
    fhirPatient,
    fhirUser,
    fhirPrimaryCancerCondition,
    fhirSecondaryCancerCondition,
    fhirEcogPerformanceStatus,
    fhirKarnofskyPerformanceStatus,
    fhirTumorMarkers,
    fhirRadiationProcedures,
    fhirSurgeryProcedures,
    fhirMedicationStatements,
  ] = await Promise.all(tasks);

  return {
    patient: convertFhirPatient(fhirPatient),
    user: convertFhirUser(fhirUser),
    primaryCancerCondition: extractPrimaryCancerCondition(fhirPrimaryCancerCondition),
    metastasis: convertFhirSecondaryCancerConditions(fhirSecondaryCancerCondition),
    ecogScore: convertFhirEcogPerformanceStatus(fhirEcogPerformanceStatus),
    karnofskyScore: convertFhirKarnofskyPerformanceStatus(fhirKarnofskyPerformanceStatus),
    biomarkers: convertFhirTumorMarkers(fhirTumorMarkers),
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
