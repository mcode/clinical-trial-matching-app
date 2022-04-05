export type FilterFormValuesType = {
  sortingOptions: {
    matchLikelihood: boolean;
    distance: boolean;
    savedStatus: boolean;
  };
  filterOptions: {
    recruitmentStatus: { [key: string]: boolean };
    trialPhase: { [key: string]: boolean };
    studyType: { [key: string]: boolean };
  };
};
