import { NamedSNOMEDCode } from "@/utils/fhirConversionUtils";

export type FullSearchParameters = SearchParameters & SortingParameters & FilterParameters & PaginationParameters;

export type SearchParameters = {
  matchingServices: string[];
  zipcode: string;
  travelDistance: string;
  age: string;
  // This is the "administrative gender" of the patient.
  gender: string;
  cancerType: string;
  cancerSubtype: string;
  metastasis: string[];
  stage: NamedSNOMEDCode;
  ecogScore: string;
  karnofskyScore: string;
  biomarkers: NamedSNOMEDCode[];
  surgery: NamedSNOMEDCode[];
  medications: NamedSNOMEDCode[];
  radiation: NamedSNOMEDCode[];
};

export type FilterParameters = {
  recruitmentStatus: string[];
  trialPhase: string[];
  studyType: string[];
};

export type SortingParameters = {
  sortingOption: string;
  savedStudies?: string[];
};

export type PaginationParameters = {
  page: string;
  pageSize: string;
};
