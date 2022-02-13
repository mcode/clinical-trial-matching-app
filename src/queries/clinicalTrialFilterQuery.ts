import { StudyDetailProps } from '@/components/Results';
import { ensureArray } from '@/components/Sidebar/Sidebar';
import { ResearchStudy } from 'fhir/r4';
import { ParsedUrlQuery } from 'querystring';
import { FilterParameters } from 'types/search-types';
import { FilterOptions, ResultsResponse } from './clinicalTrialSearchQuery';

const clinicalTrialFilterQuery = async (
  data: ResultsResponse,
  searchParams: ParsedUrlQuery
): Promise<ResultsResponse> => {
  // callWrappers is our aggregation

  const sortingOptions = ensureArray(searchParams.sortingOptions);
  const savedStudies = ensureArray(searchParams.savedStudies);
  const sorted = getSortedResults(data.results, sortingOptions, savedStudies);
  const filterParams: FilterParameters = {
    recruitmentStatus: ensureArray(searchParams.recruitmentStatus) as ResearchStudy['status'][],
    trialPhase: ensureArray(searchParams.trialPhase),
    studyType: ensureArray(searchParams.studyType),
  };
  const filtered = getFilteredResults(sorted, filterParams);

  // Dynamically generate filter options
  const filterOptions = getFilterOptions(data);

  return { results: filtered, errors: data.errors, filterOptions: filterOptions };
};

const getDistanceQuantity = (study: StudyDetailProps) =>
  study.closestFacilities?.[0]?.distance &&
  study.closestFacilities?.[0]?.distance.units === 'miles' &&
  study.closestFacilities?.[0]?.distance?.quantity;

const getSortedResults = (
  results: StudyDetailProps[],
  sortingOptions: string[],
  savedStudies: string[]
): StudyDetailProps[] => {
  const sortingFunction = (first: StudyDetailProps, second: StudyDetailProps): 0 | 1 | -1 => {
    // Highest to lowest likelihood
    if (sortingOptions?.includes('matchLikelihood')) {
      const firstLikelihood = first.likelihood?.score;
      const secondLikelihood = second.likelihood?.score;
      if (firstLikelihood && secondLikelihood) {
        if (firstLikelihood < secondLikelihood) return 1;
        if (firstLikelihood > secondLikelihood) return -1;
      }
    }

    // Lowest to highest distance
    if (sortingOptions?.includes('distance')) {
      const firstDistance = getDistanceQuantity(first);
      const secondDistance = getDistanceQuantity(second);
      if (firstDistance && secondDistance) {
        if (firstDistance < secondDistance) return -1;
        if (firstDistance > secondDistance) return 1;
      }
    }

    // Unsaved to saved trials
    if (sortingOptions?.includes('savedStatus')) {
      const firstIsSaved = savedStudies.includes(first.trialId);
      const secondIsSaved = savedStudies.includes(second.trialId);
      if (firstIsSaved === secondIsSaved) return 0;
      if (firstIsSaved) return 1;
      if (secondIsSaved) return -1;
    }

    return 0;
  };

  return results.sort(sortingFunction);
};

const getFilteredResults = (results: StudyDetailProps[], filterOptions: FilterParameters): StudyDetailProps[] => {
  const { recruitmentStatus, trialPhase, studyType } = { ...filterOptions };
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

const getFilterOptions = (data: ResultsResponse): FilterOptions => {
  const filterOptions: FilterOptions = {
    recruitmentStatus: [],
    trialPhase: [],
    studyType: [],
  };

  for (const entry of data.results) {
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

export default clinicalTrialFilterQuery;
