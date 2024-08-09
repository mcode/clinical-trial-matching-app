export type FullSearchParameters = SearchParameters &
  SortingParameters &
  FilterParameters &
  PaginationParameters &
  OriginalSearchParameters;

export type SearchParameters = {
  matchingServices: string | string[];
  zipcode: string;
  travelDistance: string;
  age: string;
  // This is the "administrative gender" of the patient.
  gender: string;
  cancerType: string;
  cancerSubtype: string;
  metastasis: string;
  stage: string;
  ecogScore: string;
  karnofskyScore: string;
  biomarkers: string;
  surgery: string;
  medications: string;
  radiation: string;
};

export type OriginalSearchParameters = {
  pre_matchingServices: string[];
  pre_zipcode: string;
  pre_travelDistance: string;
  pre_age: string;
  // This is the "administrative gender" of the patient.
  pre_gender: string;
  pre_cancerType: string;
  pre_cancerSubtype: string;
  pre_metastasis: string;
  pre_stage: string;
  pre_ecogScore: string;
  pre_karnofskyScore: string;
  pre_biomarkers: string;
  pre_surgery: string;
  pre_medications: string;
  pre_radiation: string;
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
