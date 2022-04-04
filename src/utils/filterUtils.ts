import { StudyDetailProps } from '@/components/Results';
import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { ResearchStudy } from 'fhir/r4';
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
      const firstLikelihood = first.likelihood?.score;
      const secondLikelihood = second.likelihood?.score;
      if (secondLikelihood === undefined || firstLikelihood > secondLikelihood) return -1;
      if (firstLikelihood === undefined || firstLikelihood < secondLikelihood) return 1;
    }

    // Lowest to highest distance
    if (sortingOptions?.includes('distance')) {
      const firstDistance = getDistanceQuantity(first);
      const secondDistance = getDistanceQuantity(second);
      if (secondDistance === undefined || firstDistance > secondDistance) return 1;
      if (firstDistance === undefined || firstDistance < secondDistance) return -1;
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

export const getFilterOptions = (results: StudyDetailProps[], parameters: FilterParameters): FilterOptions => {
  const filterOptions: FilterOptions = {
    recruitmentStatus: [],
    trialPhase: [],
    studyType: [],
  };

  for (const entry of results) {
    const { type, status, phase } = { ...entry };
    if (type) {
      const existingType = filterOptions.studyType.find(({ name }) => name === type);
      if (!existingType) {
        filterOptions.studyType.push({ name: type, count: 1 });
      } else {
        existingType.count += 1;
      }
    }

    if (status) {
      const existingStatus = filterOptions.recruitmentStatus.find(
        ({ name, label }) => name === status.name && label === status.label
      );
      if (!existingStatus) {
        filterOptions.recruitmentStatus.push({
          name: status.name as ResearchStudy['status'],
          label: status.label,
          count: 1,
        });
      } else {
        existingStatus.count += 1;
      }
    }

    if (phase) {
      const existingPhase = filterOptions.trialPhase.find(({ name }) => name === phase);
      if (!existingPhase) {
        filterOptions.trialPhase.push({ name: phase, count: 1 });
      } else {
        existingPhase.count += 1;
      }
    }
  }
  return filterOptions;
};
