import { ParsedUrlQuery } from 'querystring';
import { ResultsResponse } from './clinicalTrialSearchQuery';
import { StudyDetailProps } from '@/components/Results';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { sendLocationData },
} = getConfig();

const clinicalTrialDistanceQuery = async (
  response: ResultsResponse,
  searchParams: ParsedUrlQuery
): Promise<ResultsResponse> => {
  // Have the matching service wrappers already filtered the results by zip code & distance? If so, don't refilter below.
  if (sendLocationData) return response;

  // Otherwise, patient zip code & distance weren't sent to the wrappers, so do that filtering here
  const travelDistance = searchParams.travelDistance as string;
  const isStudyWithinRange = (entry: StudyDetailProps): boolean => {
    return (entry.closestFacilities?.[0]?.distance?.quantity || 0) <= parseInt(travelDistance as string);
  };
  const filtered = response.results.filter(isStudyWithinRange);

  return { ...response, results: filtered };
};

export default clinicalTrialDistanceQuery;
