import { ResultsResponse } from './clinicalTrialSearchQuery';

const clinicalTrialDistanceQuery = async (response: ResultsResponse): Promise<ResultsResponse> => {
  // Have the matching service wrappers already filtered the results by zip code & distance? If so, don't refilter below.
  return response;
};

export default clinicalTrialDistanceQuery;
