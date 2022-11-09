import { CodedValueType, Score } from '@/utils/fhirConversionUtils';

export type SearchFormValuesType = {
  matchingServices: { [key: string]: boolean };
  zipcode: string;
  travelDistance: string;
  age: string;
  gender: string;
  cancerType: CodedValueType | null;
  cancerSubtype: CodedValueType | null;
  metastasis: CodedValueType[];
  stage: CodedValueType;
  ecogScore: Score;
  karnofskyScore: Score;
  biomarkers: CodedValueType[];
  radiation: CodedValueType[];
  surgery: CodedValueType[];
  medications: CodedValueType[];
};
