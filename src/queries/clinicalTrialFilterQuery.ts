import { ensureArray } from '@/components/Sidebar/Sidebar';
import { getSortedResults, getFilteredResults, getFilterOptions } from '@/utils/filterUtils';
import { ParsedUrlQuery } from 'querystring';
import { FilterParameters, SortingParameters } from 'types/search-types';
import { ResultsResponse } from './clinicalTrialSearchQuery';

const clinicalTrialFilterQuery = async (
  { results, errors }: ResultsResponse,
  searchParams: ParsedUrlQuery
): Promise<ResultsResponse> => {
  const sortingParameters: SortingParameters = {
    sortingOptions: ensureArray(searchParams.sortingOptions),
    savedStudies: ensureArray(searchParams.savedStudies),
  };
  const filterParameters: FilterParameters = {
    recruitmentStatus: ensureArray(searchParams.recruitmentStatus),
    trialPhase: ensureArray(searchParams.trialPhase),
    studyType: ensureArray(searchParams.studyType),
  };

  const sorted = getSortedResults(results, sortingParameters);
  const filtered = getFilteredResults(sorted, filterParameters);

  // Dynamically generate filter options
  const filterOptions = getFilterOptions(sorted, filterParameters);

  return { results: filtered, errors, filterOptions };
};

export default clinicalTrialFilterQuery;
