import { StudyDetailProps } from '@/components/Results';
import { FilterOption, FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { FilterParameters, SortingParameters } from 'types/search-types';

const getDistanceQuantity = (study: StudyDetailProps) =>
  study.closestFacilities?.[0]?.distance &&
  study.closestFacilities?.[0]?.distance.units === 'miles' &&
  study.closestFacilities?.[0]?.distance?.quantity;

const sortBySavedStatus = (savedStudies: string[], first: StudyDetailProps, second: StudyDetailProps) => {
  // Saved to unsaved trials
  const firstIsSaved = savedStudies.includes(first.trialId);
  const secondIsSaved = savedStudies.includes(second.trialId);
  if (!(firstIsSaved && secondIsSaved)) {
    if (firstIsSaved) return -1;
    if (secondIsSaved) return 1;
  }
  return 0;
};

const sortByMatchLikelihood = (first: StudyDetailProps, second: StudyDetailProps) => {
  // Highest to lowest likelihood
  const firstLikelihood = first.likelihood.score;
  const secondLikelihood = second.likelihood.score;
  if (firstLikelihood > secondLikelihood) return -1;
  if (firstLikelihood < secondLikelihood) return 1;
  return 0;
};

const sortByDistance = (first: StudyDetailProps, second: StudyDetailProps) => {
  // Lowest to highest distance
  const firstDistance = getDistanceQuantity(first);
  const secondDistance = getDistanceQuantity(second);

  // A trial may as well be infinitely distant if it has no distance
  if (!(firstDistance === undefined && secondDistance === undefined)) {
    if (firstDistance === undefined || firstDistance > secondDistance) return 1;
    if (secondDistance === undefined || firstDistance < secondDistance) return -1;
  }
  return 0;
};

export const getSortedResults = (
  results: StudyDetailProps[],
  { sortingOption, savedStudies }: SortingParameters
): StudyDetailProps[] => {
  const sortingFunction = (first: StudyDetailProps, second: StudyDetailProps) => {
    const matchLikelihood = () => sortByMatchLikelihood(first, second);
    const distance = () => sortByDistance(first, second);
    const savedStatus = () => sortBySavedStatus(savedStudies, first, second);

    switch (sortingOption) {
      case 'matchLikelihood':
        return matchLikelihood() || distance() || savedStatus();
      case 'distance':
        return distance() || matchLikelihood() || savedStatus();
      case 'savedStatus':
        return savedStatus() || matchLikelihood() || distance();
      default:
        return 0;
    }
  };

  return results.slice().sort(sortingFunction);
};

export const getFilteredResults = (
  results: StudyDetailProps[],
  { recruitmentStatus, trialPhase, studyType }: FilterParameters
): StudyDetailProps[] => {
  const filteringByRecruitmentStatus = recruitmentStatus.length === 0;
  const filteringByTrialPhase = trialPhase.length === 0;
  const filteringByStudyType = studyType.length === 0;

  const filterFunction = (entry: StudyDetailProps): boolean => {
    const filterByRecruitmentStatus = filteringByRecruitmentStatus || recruitmentStatus.includes(entry.status.name);
    const filterByTrialPhase = filteringByTrialPhase || trialPhase.includes(entry.phase);
    const filterByStudyType = filteringByStudyType || studyType.includes(entry.type?.name);
    return filterByRecruitmentStatus && filterByTrialPhase && filterByStudyType;
  };
  return results.filter(filterFunction);
};

const getCheckedEntryMap = (
  { type, status, phase }: StudyDetailProps,
  { studyType, recruitmentStatus, trialPhase }: FilterParameters
): {
  type: boolean;
  status: boolean;
  phase: boolean;
} => ({
  type: studyType.length === 0 || studyType.includes(type.name),
  status: recruitmentStatus.length === 0 || recruitmentStatus.includes(status?.name),
  phase: trialPhase.length === 0 || trialPhase.includes(phase),
});

const getIntializedEntryMap = (
  { type, status, phase }: StudyDetailProps,
  { studyType, recruitmentStatus, trialPhase }: FilterOptions
): {
  type: FilterOption;
  status: FilterOption;
  phase: FilterOption;
} => {
  const typeExists = ({ name }: FilterOption): boolean => name === type.name;
  const statusExists = ({ name, label }: FilterOption): boolean => name === status?.name && label === status?.label;
  const phaseExists = ({ name }: FilterOption): boolean => name === phase;

  return {
    type: studyType.find(typeExists),
    status: recruitmentStatus.find(statusExists),
    phase: trialPhase.find(phaseExists),
  };
};

export const getFilterOptions = (results: StudyDetailProps[], parameters: FilterParameters): FilterOptions => {
  const filterOptions: FilterOptions = {
    recruitmentStatus: [],
    trialPhase: [],
    studyType: [],
  };

  for (const entry of results) {
    const { type, status, phase } = { ...entry };
    const checked = getCheckedEntryMap(entry, parameters);
    const initialized = getIntializedEntryMap(entry, filterOptions);

    if (!initialized.type) {
      const count = checked.status && checked.phase ? 1 : 0;
      const { name, label } = { ...type };
      filterOptions.studyType.push({ name, label, count });
    } else if (checked.status && checked.phase) {
      initialized.type.count += 1;
    }

    if (!initialized.status) {
      const count = checked.type && checked.phase ? 1 : 0;
      const { name, label } = { ...status };
      filterOptions.recruitmentStatus.push({ name, label, count });
    } else if (checked.type && checked.phase) {
      initialized.status.count += 1;
    }

    if (!initialized.phase) {
      const count = checked.status && checked.type ? 1 : 0;
      filterOptions.trialPhase.push({ name: phase, count });
    } else if (checked.status && checked.type) {
      initialized.phase.count += 1;
    }
  }

  // Filter the options by name
  for (const filter in filterOptions) {
    filterOptions[filter] = filterOptions[filter].sort((a, b) => a.name.localeCompare(b.name));
  }

  return filterOptions;
};
