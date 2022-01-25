import { ContactProps } from '@/components/Results';
import { Patient, User } from '@/utils/fhirConversionUtils';
import { Bundle } from 'fhir/r4';
import { ParsedUrlQuery } from 'querystring';

export type ResultsResponse = {
  results?: Bundle;
  errors?: ErrorResponse[];
  closestFacilities?: ContactProps[];
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
