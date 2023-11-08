/*
 * Module for dealing with converting data from Epic
 */

import ecogScores from '@/assets/optimizedPatientDataElements/ecogScores.json';
import karnofskyScores from '@/assets/optimizedPatientDataElements/karnofskyScores.json';
import { Observation } from 'fhir/r4';
import { Score } from './fhirConversionUtils';

export const extractEcogScore = (observation: Observation): string | null => {
  // Extract the ECOG score if possible
  if (observation.resourceType !== 'Observation') {
    return null;
  }
  if (Array.isArray(observation.component)) {
    // For now, assume it can only be the first one
    if (observation.component.length > 0) {
      return observation.component[0]?.valueString ?? null;
    }
  }
  return null;
};

export const convertEcogScore = (observation: Observation | undefined): Score | null => {
  if (typeof observation !== 'object') {
    return null;
  }
  const score = Number(extractEcogScore(observation));
  for (const ecogScore of ecogScores) {
    if (ecogScore.valueInteger == score) {
      return ecogScore as Score;
    }
  }
  return null;
};

// This appears to be stored in the same way the ECOG score is, so just alias it for now
export const extractKarnofskyScore = extractEcogScore;

export const convertKarnofskyScore = (observation: Observation | undefined): Score | null => {
  if (typeof observation !== 'object') {
    return null;
  }
  // This is relying on the first part of the string being a number, and parseInt ignoring anything past the first
  // non-digit character. So "100% - No Complaints" becomes 100.
  const score = parseInt(extractKarnofskyScore(observation));
  for (const karnofskyScore of karnofskyScores) {
    if (karnofskyScore.valueInteger == score) {
      return karnofskyScore as Score;
    }
  }
  return null;
};
