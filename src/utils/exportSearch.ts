import { SearchFormValuesType } from '@/components/SearchForm/types';
import { stringify as csvStringify } from 'csv-stringify/browser/esm/sync';
import { Biomarker, CodedValueType, Score } from './fhirConversionUtils';

type SearchCSVRecord = [string, string, '' | number, string, string, string, string];
type ParameterName = keyof SearchFormValuesType;

const appendRecord = (records: SearchCSVRecord[], name: ParameterName, value?: string): void => {
  if (typeof value === 'string') records.push([name, value, '', '', '', '', '']);
};

const createCodedValueTypeRecord = (name: ParameterName, value: CodedValueType): SearchCSVRecord => {
  return [name, value.display, '', value.code, value.system, '', ''];
};

const appendCodedValueType = (records: SearchCSVRecord[], name: ParameterName, value?: CodedValueType): void => {
  if (value) records.push(createCodedValueTypeRecord(name, value));
};

const appendCodedValueTypes = (records: SearchCSVRecord[], name: ParameterName, values: CodedValueType[]): void => {
  records.push(...values.map(value => createCodedValueTypeRecord(name, value)));
};

const appendScore = (records: SearchCSVRecord[], name: ParameterName, value: Score): void => {
  if (value)
    records.push([
      name,
      value.interpretation.display,
      value.valueInteger,
      value.interpretation.code,
      value.interpretation.system,
      '',
      '',
    ]);
};

const appendBiomarkers = (records: SearchCSVRecord[], name: ParameterName, values: CodedValueType[]): void => {
  if (values) {
    for (const value of values) {
      // Each value should actually be a biomarker
      records.push([
        name,
        value.display,
        '',
        value.code,
        value.system,
        (value as Biomarker).qualifier?.code ?? '',
        (value as Biomarker).qualifier?.system ?? '',
      ]);
    }
  }
};

export const generateSearchCSVRecords = (searchParameters: SearchFormValuesType): SearchCSVRecord[] => {
  const records: SearchCSVRecord[] = [];
  // All of these only append if the values exist
  appendRecord(records, 'zipcode', searchParameters.zipcode);
  appendRecord(records, 'travelDistance', searchParameters.travelDistance);
  appendRecord(records, 'gender', searchParameters.gender);
  appendRecord(records, 'age', searchParameters.age);
  appendCodedValueType(records, 'cancerType', searchParameters.cancerType);
  appendCodedValueType(records, 'cancerSubtype', searchParameters.cancerSubtype);
  appendCodedValueTypes(records, 'metastasis', searchParameters.metastasis);
  appendCodedValueType(records, 'stage', searchParameters.stage);
  appendScore(records, 'ecogScore', searchParameters.ecogScore);
  appendScore(records, 'karnofskyScore', searchParameters.karnofskyScore);
  appendBiomarkers(records, 'biomarkers', searchParameters.biomarkers);
  appendCodedValueTypes(records, 'radiation', searchParameters.radiation);
  appendCodedValueTypes(records, 'surgery', searchParameters.surgery);
  appendCodedValueTypes(records, 'medications', searchParameters.medications);
  return records;
};

export const generateSearchCSVString = (searchParameters: SearchFormValuesType): string => {
  return (
    csvStringify([
      ['OPDE Category', 'Value (text)', 'Value (integer)', 'Code', 'System', 'Qualifier Code', 'Qualifier System'],
    ]) + csvStringify(generateSearchCSVRecords(searchParameters))
  );
};

export default generateSearchCSVString;
