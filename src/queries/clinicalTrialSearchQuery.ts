import { StudyDetailProps } from '@/components/Results';
import { Patient, User } from '@/utils/fhirConversionUtils';
import { ParsedUrlQuery } from 'querystring';

export type Results = {
  total: number;
  entry: StudyDetailProps[];
};

export type FilterOptions = {
  recruitmentStatus: FilterOption[];
  trialPhase: FilterOption[];
  studyType: FilterOption[];
};

export type FilterOption = { name: string; label?: string; count: number };

export type ResultsResponse = {
  results?: StudyDetailProps[];
  errors?: ErrorResponse[];
  filterOptions?: FilterOptions;
  total?: number;
};

export type ErrorResponse = {
  status: string;
  response: string;
  serviceName: string;
  error?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type Service = {
  name: string;
  label: string;
  url: string;
  searchRoute: string;
  defaultValue?: boolean;
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
