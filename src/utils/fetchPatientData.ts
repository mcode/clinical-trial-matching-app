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
  diseaseStatus: CodedValueType;
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

const defaultProgressMonitor = (): ProgressMonitor => {
  let currentProgressMessage = 'Fetching patient data...';
  let totalWorkDone = 0;
  let totalWorkUnits = 0;
  return (message: string, workDone?: number, workTotal?: number): void => {
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
};

/**
 * Allows a progress monitor to split work units within a sub process over work units in a parent process
 * @param rootMonitor the root progress monitor
 * @param totalParentUnits the total number of work units to progress in the parent
 */
export const subProgressMonitor = (rootMonitor: ProgressMonitor, totalParentUnits: number): ProgressMonitor => {
  let totalWorkDone = 0,
    lastWorkDone = 0;
  let totalWorkUnits: number;
  return (message: string, workDone?: number, workTotal?: number): void => {
    if (typeof message === 'number') {
      workDone = message;
    }
    if (workDone !== undefined) {
      totalWorkDone += workDone;
    }
    if (workTotal !== undefined && totalWorkUnits === undefined) {
      // It only makes sense to set total work units once
      totalWorkUnits = workTotal;
    }
    let newUnits = 0;
    if (totalWorkUnits !== undefined && totalWorkDone != lastWorkDone) {
      newUnits =
        Math.floor((totalWorkDone / totalWorkUnits) * totalParentUnits) -
        Math.floor((lastWorkDone / totalWorkUnits) * totalParentUnits);
      if (newUnits > 0) {
        lastWorkDone = totalWorkDone;
      }
    }
    // If we have a message to send or new work units to send, send those
    if (typeof message === 'string') {
      rootMonitor(message, newUnits);
    } else if (newUnits > 0) {
      rootMonitor(newUnits);
    }
  };
};

export const fetchPatientData = (
  fhirClient: Client,
  clientName: string,
  progress?: ProgressMonitor
): Promise<PatientData> => {
  if (progress === undefined) {
    progress = defaultProgressMonitor();
  }
  if (clientName === 'epic') {
    return fetchEpicPatientData(fhirClient, progress);
  }
  // The default fallback is the sandbox implementation
  return fetchSandboxPatientData(fhirClient, progress);
};
