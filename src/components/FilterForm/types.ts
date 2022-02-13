import { ResearchStudy } from 'fhir/r4';

export type FilterFormValuesType = {
  sortingOptions: {
    matchLikelihood: boolean;
    distance: boolean;
    savedStatus: boolean;
  };
  filterOptions: {
    recruitmentStatus: { [key in ResearchStudy['status']]: boolean };
    trialPhase: { [key: string]: boolean };
    studyType: { [key: string]: boolean };
  };
};
