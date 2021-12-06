import { Patient, User } from '@/utils/fhirConversionUtils';
import { Bundle } from 'fhir/r4';
import { ParsedUrlQuery } from 'querystring';

export type ResultsResponse = {
  results?: Bundle;
  errors?: ErrorResponse[];
};

export type ErrorResponse = {
  status: string;
  response: string;
};

const clinicalTrialSearchQuery = async (
  patient: Patient,
  user: User,
  search_params: ParsedUrlQuery
): Promise<ResultsResponse> =>
  fetch('/api/clinical-trial-search', {
    cache: 'no-store',
    method: 'post',
    body: JSON.stringify({ patient, user, search_params }, null, 2),
  }).then(res => res.json());

export default clinicalTrialSearchQuery;
