import { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';

export type SearchFormValuesType = {
  matchingServices: { [key: string]: boolean };
  zipcode: string;
  travelDistance: string;
  age: string;
  gender: string;
  cancerType: NamedSNOMEDCode | null;
  cancerSubtype: NamedSNOMEDCode | null;
  metastasis: string[];
  stage: string;
  ecogScore: string;
  karnofskyScore: string;
  biomarkers: string[];
  radiation: string[];
  surgery: string[];
  medications: string[];
};
