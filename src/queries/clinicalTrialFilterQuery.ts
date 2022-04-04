import { ensureArray } from '@/components/Sidebar/Sidebar';
import { getSortedResults, getFilteredResults, getFilterOptions } from '@/utils/filterUtils';
import { ResearchStudy } from 'fhir/r4';
import { ParsedUrlQuery } from 'querystring';
import { FilterParameters } from 'types/search-types';
import { ResultsResponse } from './clinicalTrialSearchQuery';

const clinicalTrialFilterQuery = async (
  { results, errors }: ResultsResponse,
  searchParams: ParsedUrlQuery
): Promise<ResultsResponse> => {
  const sortingOptions = ensureArray(searchParams.sortingOptions);
  const savedStudies = ensureArray(searchParams.savedStudies);
  const sorted = getSortedResults(results, sortingOptions, savedStudies);

  const filterParameters: FilterParameters = {
    recruitmentStatus: ensureArray(searchParams.recruitmentStatus) as ResearchStudy['status'][],
    trialPhase: ensureArray(searchParams.trialPhase),
    studyType: ensureArray(searchParams.studyType),
  };
  const filtered = getFilteredResults(sorted, filterParameters);

  // Dynamically generate filter options, count for each label depends on inputted parameters
  const filterOptions = getFilterOptions(sorted, filterParameters);

  return { results: filtered, errors, filterOptions };
};

export default clinicalTrialFilterQuery;
