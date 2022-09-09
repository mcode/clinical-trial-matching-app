import { CodedValueType } from '@/utils/fhirConversionUtils';

export type SearchFormValuesType = {
  matchingServices: { [key: string]: boolean };
  zipcode: string;
  travelDistance: string;
  age: string;
  gender: string;
  cancerType: CodedValueType | null;
  cancerSubtype: CodedValueType | null;
  metastasis: string[];
  stage: CodedValueType;
  ecogScore: string;
  karnofskyScore: string;
  biomarkers: CodedValueType[];
  radiation: CodedValueType[];
  surgery: CodedValueType[];
  medications: CodedValueType[];
};
