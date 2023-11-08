/**
 * This module provides the basic API for fetching patient data.
 */

import type Client from 'fhirclient/lib/Client';
import fetchEpicPatientData from './epic/fetchPatientData';
import { Biomarker, CodedValueType, Patient, PrimaryCancerCondition, Score, User } from './fhirConversionUtils';
import fetchSandboxPatientData from './sandbox/fetchPatientData';

export interface PatientData {
  patient: Patient;
  user?: User;
  primaryCancerCondition: PrimaryCancerCondition;
  metastasis: CodedValueType[];
  ecogScore: Score;
  karnofskyScore: Score;
  biomarkers: Biomarker[];
  radiation: CodedValueType[];
  surgery: CodedValueType[];
  medications: CodedValueType[];
}

/**
 * Simple method of display progress. The goal is for this to be forwarded to the user, for now, it's just dumped to
 * the console.
 * @param message the message to show for current work, or the progress done if a number
 * @param workDone the total number of work units done *with this call*. Each call will increase the total completed
 * by this value
 * @param workTotal the total number of work units to do, or undefined if unknown
 */
export type ProgressMonitor = (message: string | number, workDone?: number, workTotal?: number) => void;

/**
 * Patient data fetch function.
 */
export type PatientDataFetchFunction = (fhirClient: Client, progressMonitor: ProgressMonitor) => Promise<PatientData>;

export const fetchPatientData = (fhirClient: Client, clientName: string): Promise<PatientData> => {
  let currentProgressMessage = 'Fetching patient data...';
  let totalWorkDone = 0;
  let totalWorkUnits = 0;
  const progress = (message: string, workDone?: number, workTotal?: number): void => {
    if (typeof message === 'number') {
      workDone = message;
    } else {
      currentProgressMessage = message;
    }
    if (workDone !== undefined) {
      totalWorkDone += workDone;
    }
    if (workTotal !== undefined) {
      totalWorkUnits = workTotal;
    }
    const percent = totalWorkUnits > 0 ? Math.min((totalWorkDone / totalWorkUnits) * 100, 100) : undefined;
    console.log(
      `[${
        typeof percent === 'undefined' ? ' -- ' : percent.toFixed(0).padStart(3, ' ') + '%'
      }] ${currentProgressMessage}`
    );
  };
  if (clientName === 'epic') {
    return fetchEpicPatientData(fhirClient, progress);
  }
  // The default fallback is the sandbox implementation
  return fetchSandboxPatientData(fhirClient, progress);
};
