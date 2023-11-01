import biomarkers from '../assets/optimizedPatientDataElements/biomarkers.json';
import medications from '../assets/optimizedPatientDataElements/medications.json';
import metastases from '../assets/optimizedPatientDataElements/metastases.json';
import radiations from '../assets/optimizedPatientDataElements/radiations.json';
import surgeries from '../assets/optimizedPatientDataElements/surgeries.json';
import { CodedValueType } from './fhirConversionUtils';

/**
 *
 * @param values the values to check
 * @returns the extracted codes
 */
export const extractCodes = (values: CodedValueType[]): string[] => {
  return values.map<string>(value => value.code);
};

export const convertToCodedValueTypes = <T extends CodedValueType>(values: string[], fullValues: T[]): T[] => {
  // Soooo... the full values is likely to be an enormous array, and values is
  // likely to be much smaller. Because of that, make a set of values we want
  // to recreate.
  const valueSet = new Set(values);
  // Next, create a map that will contain those values
  const valueMap = new Map<string, T>();
  // Now, since we'd have to do an exhaustive search of the full values
  // *anyway*, go ahead and do that.
  for (const fullValue of fullValues) {
    const code = fullValue.code;
    if (valueSet.has(code)) {
      // Store this in the map for later use
      valueMap.set(code, fullValue);
      // Remove the code from the set
      valueSet.delete(code);
      if (valueSet.size === 0) {
        // We found everything, so we can stop!
        break;
      }
    }
  }
  if (valueSet.size > 0) {
    console.log('Warning: Unable to find values for the following code: ', valueSet);
  }
  // Now, use the map we created to reconstruct the values
  return values.map<T>(value => valueMap.get(value));
};

export const convertCodesToBiomarkers = (values: string[]): CodedValueType[] =>
  convertToCodedValueTypes(values, biomarkers as CodedValueType[]);

export const convertCodesToMedications = (values: string[]): CodedValueType[] =>
  convertToCodedValueTypes(values, medications as CodedValueType[]);

export const convertCodesToMetastases = (values: string[]): CodedValueType[] =>
  convertToCodedValueTypes(values, metastases as CodedValueType[]);

export const convertCodesToRadiations = (values: string[]): CodedValueType[] =>
  convertToCodedValueTypes(values, radiations as CodedValueType[]);

export const convertCodesToSurgeries = (values: string[]): CodedValueType[] =>
  convertToCodedValueTypes(values, surgeries as CodedValueType[]);
