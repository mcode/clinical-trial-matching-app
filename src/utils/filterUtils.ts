import { StudyDetailProps } from '@/components/Results';
import { FilterOption, FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { FilterParameters } from 'types/search-types';

const getDistanceQuantity = (study: StudyDetailProps) =>
  study.closestFacilities?.[0]?.distance &&
  study.closestFacilities?.[0]?.distance.units === 'miles' &&
  study.closestFacilities?.[0]?.distance?.quantity;

export const getSortedResults = (
  results: StudyDetailProps[],
  sortingOptions: string[],
  savedStudies: string[]
): StudyDetailProps[] => {
  const sortingFunction = (first: StudyDetailProps, second: StudyDetailProps) => {
    // Saved to unsaved trials
    if (sortingOptions?.includes('savedStatus')) {
      const firstIsSaved = savedStudies.includes(first.trialId);
      const secondIsSaved = savedStudies.includes(second.trialId);
      if (!(firstIsSaved && secondIsSaved)) {
        if (firstIsSaved) return -1;
        if (secondIsSaved) return 1;
      }
    }

    // Highest to lowest likelihood
    if (sortingOptions?.includes('matchLikelihood')) {
      // Even if a trial doesn't have a likelihood, it might be better for the patient to decide whether it's a match than for them to never see it
      const firstLikelihood = first.likelihood?.score === undefined ? 1 : first.likelihood?.score;
      const secondLikelihood = second.likelihood?.score === undefined ? 1 : second.likelihood?.score;
      if (firstLikelihood > secondLikelihood) return -1;
      if (firstLikelihood < secondLikelihood) return 1;
    }

    // Lowest to highest distance
    if (sortingOptions?.includes('distance')) {
      const firstDistance = getDistanceQuantity(first);
      const secondDistance = getDistanceQuantity(second);
      // A trial may as well be infinitely distant if it has no distance
      if (!(firstDistance === undefined && secondDistance === undefined)) {
        if (firstDistance === undefined || firstDistance > secondDistance) return 1;
        if (secondDistance === undefined || firstDistance < secondDistance) return -1;
      }
    }

    return 0;
  };

  return results.slice().sort(sortingFunction);
};

export const getFilteredResults = (results: StudyDetailProps[], parameters: FilterParameters): StudyDetailProps[] => {
  const { recruitmentStatus, trialPhase, studyType } = { ...parameters };
  const filteringByRecruitmentStatus = recruitmentStatus?.length === 0;
  const filteringByTrialPhase = trialPhase?.length === 0;
  const filteringByStudyType = studyType?.length === 0;

  const filterFunction = (entry: StudyDetailProps): boolean => {
    const filterByRecruitmentStatus = filteringByRecruitmentStatus || recruitmentStatus?.includes(entry.status.name);
    const filterByTrialPhase = filteringByTrialPhase || trialPhase?.includes(entry.phase);
    const filterByStudyType = filteringByStudyType || studyType?.includes(entry.type);
    return filterByRecruitmentStatus && filterByTrialPhase && filterByStudyType;
  };
  return results.filter(filterFunction);
};

const getCheckedEntryMap = (
  entry: StudyDetailProps,
  parameters: FilterParameters
): {
  type: boolean;
  status: boolean;
  phase: boolean;
} => {
  const { type, status, phase } = { ...entry };
  const { studyType, recruitmentStatus, trialPhase } = parameters;
  return {
    type: studyType.length === 0 || studyType.includes(type),
    status: recruitmentStatus.length === 0 || recruitmentStatus.includes(status?.name),
    phase: trialPhase.length === 0 || trialPhase.includes(phase),
  };
};

const getIntializedEntryMap = (
  entry: StudyDetailProps,
  filterOptions: FilterOptions
): {
  type: FilterOption;
  status: FilterOption;
  phase: FilterOption;
} => {
  const { type, status, phase } = { ...entry };
  const { studyType, recruitmentStatus, trialPhase } = filterOptions;

  const typeExists = ({ name }: FilterOption): boolean => name === type;
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
      filterOptions.studyType.push({ name: type, count });
    } else if (checked.status && checked.phase) {
      initialized.type.count += 1;
    }

    if (!initialized.status) {
      const count = checked.type && checked.phase ? 1 : 0;
      filterOptions.recruitmentStatus.push({
        name: status.name,
        label: status.label,
        count,
      });
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
  return filterOptions;
};
