import { Bundle } from 'fhir/r4';

export type ResultsResponse = {
  results?: Bundle;
  errors?: ErrorResponse[];
};

export type ErrorResponse = {
  status: string;
  response: string;
};

const clinicalTrialSearchQuery = async (patient, user, search_params): Promise<ResultsResponse> =>
  fetch('/api/clinical-trial-search', {
    cache: 'no-store',
    method: 'post',
    body: JSON.stringify({ patient, user, search_params }, null, 2),
  }).then(res => res.json());

export default clinicalTrialSearchQuery;
