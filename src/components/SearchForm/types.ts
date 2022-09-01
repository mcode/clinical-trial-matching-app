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
  stage: NamedSNOMEDCode;
  ecogScore: string;
  karnofskyScore: string;
  biomarkers: NamedSNOMEDCode[];
  radiation: NamedSNOMEDCode[];
  surgery: NamedSNOMEDCode[];
  medications: NamedSNOMEDCode[];
};
