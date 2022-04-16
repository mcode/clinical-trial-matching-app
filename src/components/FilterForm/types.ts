export type FilterFormValuesType = {
  sortingOption: 'matchLikelihood' | 'distance' | 'savedStatus';
  filterOptions: {
    recruitmentStatus: { [key: string]: boolean };
    trialPhase: { [key: string]: boolean };
    studyType: { [key: string]: boolean };
  };
};
