import { StudyDetailProps } from '@/components/Results';
import { Patient, User } from '@/utils/fhirConversionUtils';
import { ParsedUrlQuery } from 'querystring';

export type Results = {
  total: number;
  entry: StudyDetailProps[];
};

export type ResultsResponse = {
  results?: StudyDetailProps[];
  errors?: ErrorResponse[];
};

export type ErrorResponse = {
  status: string;
  response: string;
  serviceName: string;
  error?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const clinicalTrialSearchQuery = async (
  patient: Patient,
  user: User,
  searchParams: ParsedUrlQuery
): Promise<ResultsResponse> =>
  fetch('/api/clinical-trial-search', {
    cache: 'no-store',
    method: 'post',
    body: JSON.stringify({ patient, user, searchParams }, null, 2),
  }).then(res => res.json());

export default clinicalTrialSearchQuery;
