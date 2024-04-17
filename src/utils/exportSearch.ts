import { SearchFormValuesType } from '@/components/SearchForm/types';
import { stringify as csvStringify } from 'csv-stringify/sync';
import { Biomarker, CodedValueType, Score } from './fhirConversionUtils';

type SearchCSVRecord = [string, string, '' | number, string, string, string, string, boolean];
type ParameterName = keyof SearchFormValuesType;

const appendRecord = (
  records: SearchCSVRecord[],
  name: ParameterName | 'id',
  value?: string,
  manuallyAdjusted = false
): void => {
  if (typeof value === 'string') records.push([name, value, '', '', '', '', '', manuallyAdjusted]);
};

const createCodedValueTypeRecord = (
  name: ParameterName,
  value: CodedValueType,
  manuallyAdjusted = false
): SearchCSVRecord => {
  return [name, value.display, '', value.code, value.system, '', '', manuallyAdjusted];
};

const appendCodedValueType = (
  records: SearchCSVRecord[],
  name: ParameterName,
  value?: CodedValueType,
  manuallyAdjusted = false
): void => {
  if (value) records.push(createCodedValueTypeRecord(name, value, manuallyAdjusted));
};

const appendCodedValueTypes = (
  records: SearchCSVRecord[],
  name: ParameterName,
  values: CodedValueType[],
  manuallyAdjusted
): void => {
  records.push(
    ...values.map(value => {
      const individuallyAdjusted = manuallyAdjusted[[name, ...Object.values(value)].join('')];
      return createCodedValueTypeRecord(name, value, individuallyAdjusted);
    })
  );
};

const appendScore = (records: SearchCSVRecord[], name: ParameterName, value: Score, manuallyAdjusted = false): void => {
  if (value)
    records.push([
      name,
      value.interpretation.display,
      value.valueInteger,
      value.interpretation.code,
      value.interpretation.system,
      '',
      '',
      manuallyAdjusted,
    ]);
};

const appendBiomarkers = (
  records: SearchCSVRecord[],
  name: ParameterName,
  values: CodedValueType[],
  manuallyAdjusted
): void => {
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
        manuallyAdjusted[[name, ...Object.values(value)].join('')],
      ]);
    }
  }
};

export type SearchFormManuallyAdjustedType = {
  [P in keyof Omit<SearchFormValuesType, 'matchingServices'>]?: boolean;
};

export const generateSearchCSVRecords = (
  searchParameters: SearchFormValuesType,
  userId: string,
  manuallyAdjusted: SearchFormManuallyAdjustedType
): SearchCSVRecord[] => {
  const records: SearchCSVRecord[] = [];
  // All of these only append if the values exist
  appendRecord(records, 'id', userId);
  appendRecord(records, 'zipcode', searchParameters.zipcode);
  appendRecord(records, 'travelDistance', searchParameters.travelDistance);
  appendRecord(records, 'gender', searchParameters.gender, manuallyAdjusted?.gender);
  appendRecord(records, 'age', searchParameters.age, manuallyAdjusted?.age);
  appendCodedValueType(records, 'cancerType', searchParameters.cancerType, manuallyAdjusted?.cancerType);
  appendCodedValueType(records, 'cancerSubtype', searchParameters.cancerSubtype, manuallyAdjusted?.cancerSubtype);
  appendCodedValueType(records, 'diseaseStatus', searchParameters.diseaseStatus, manuallyAdjusted?.diseaseStatus);
  appendCodedValueTypes(records, 'metastasis', searchParameters.metastasis, manuallyAdjusted);
  appendCodedValueType(records, 'stage', searchParameters.stage, manuallyAdjusted?.stage);
  appendScore(records, 'ecogScore', searchParameters.ecogScore, manuallyAdjusted?.ecogScore);
  appendScore(records, 'karnofskyScore', searchParameters.karnofskyScore, manuallyAdjusted?.karnofskyScore);
  appendBiomarkers(records, 'biomarkers', searchParameters.biomarkers, manuallyAdjusted);
  appendCodedValueTypes(records, 'radiation', searchParameters.radiation, manuallyAdjusted);
  appendCodedValueTypes(records, 'surgery', searchParameters.surgery, manuallyAdjusted);
  appendCodedValueTypes(records, 'medications', searchParameters.medications, manuallyAdjusted);
  return records;
};

export const generateSearchCSVString = (
  searchParameters: SearchFormValuesType,
  userId: string,
  manuallyAdjusted: SearchFormManuallyAdjustedType
): string => {
  return (
    csvStringify([
      [
        'OPDE Category',
        'Value (text)',
        'Value (integer)',
        'Code',
        'System',
        'Qualifier Code',
        'Qualifier System',
        'Manually Adjusted',
      ],
    ]) + csvStringify(generateSearchCSVRecords(searchParameters, userId, manuallyAdjusted))
  );
};

export default generateSearchCSVString;
