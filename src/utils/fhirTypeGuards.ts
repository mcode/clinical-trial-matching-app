/**
 * For enumerated types, this contains type guards to validate them.
 */

import { AdministrativeGender } from 'types/fhir-types';

export const isAdministrativeGender = (o: unknown): o is AdministrativeGender => {
  return typeof o === 'string' && (o === 'male' || o === 'female' || o === 'other' || o === 'unknown');
};
