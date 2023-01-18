/**
 * For enumerated types, this contains type guards to validate them.
 */

import type { Patient } from 'fhir/r4';

export type AdministrativeGender = Patient['gender'];

export const isAdministrativeGender = (o: unknown): o is AdministrativeGender => {
  return typeof o === 'string' && (o === 'male' || o === 'female' || o === 'other' || o === 'unknown');
};
