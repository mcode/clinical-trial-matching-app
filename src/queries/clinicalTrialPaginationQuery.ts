import { ParsedUrlQuery } from 'querystring';
import { ResultsResponse } from './clinicalTrialSearchQuery';

export const DEFAULT_PAGE = '1';
export const DEFAULT_PAGE_SIZE = '10';

const clinicalTrialPaginationQuery = async (
  response: ResultsResponse,
  searchParams: ParsedUrlQuery
): Promise<ResultsResponse> => {
  const page = parseInt(searchParams.page as string);
  const pageSize = parseInt(searchParams.pageSize as string);

  // Pages are 1-indexed in query parameters
  const start = pageSize * (page - 1);
  const end = pageSize * (page - 1) + pageSize;

  return {
    ...response,
    results: response.results.slice(start, end),
    total: response.results.length,
  };
};

export default clinicalTrialPaginationQuery;
