import { ResearchStudy } from 'fhir/r4';

export type FullSearchParameters = SearchParameters & Partial<FilterParameters> & Partial<MiscellaneousParameters>;

export type SearchParameters = {
  matchingServices: string[];
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
  bioMarkers: string;
  surgery: string;
  medications: string;
  radiation: string;
};

export type FilterParameters = {
  sortingOptions?: string[];
  recruitmentStatus?: ResearchStudy['status'][];
  trialPhase?: string[];
  studyType?: string[];
};

type MiscellaneousParameters = {
  savedStudies: string[];
};
