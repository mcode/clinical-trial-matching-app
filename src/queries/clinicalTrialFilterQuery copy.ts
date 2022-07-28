import { ensureArray } from '@/components/Sidebar/Sidebar';
import { getSortedResults, getFilteredResults, getFilterOptions } from '@/utils/filterUtils';
import { ParsedUrlQuery } from 'querystring';
import { FilterParameters, SortingParameters } from 'types/search-types';
import { ResultsResponse } from './clinicalTrialSearchQuery';

const clinicalTrialFilterQuery = async (
  response: ResultsResponse,
  searchParams: ParsedUrlQuery
): Promise<ResultsResponse> => {
  const sortingParameters: SortingParameters = {
    sortingOption: searchParams.sortingOption as string,
    savedStudies: ensureArray(searchParams.savedStudies),
  };
  const filterParameters: FilterParameters = {
    recruitmentStatus: ensureArray(searchParams.recruitmentStatus),
    trialPhase: ensureArray(searchParams.trialPhase),
    studyType: ensureArray(searchParams.studyType),
  };

  const sorted = getSortedResults(response.results, sortingParameters);
  const filtered = getFilteredResults(sorted, filterParameters);

  // Dynamically generate filter options
  const filterOptions = getFilterOptions(sorted, filterParameters);

  return { ...response, results: filtered, filterOptions };
};

export default clinicalTrialFilterQuery;
