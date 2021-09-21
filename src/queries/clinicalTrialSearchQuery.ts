import { fhirclient } from 'fhirclient/lib/types';

const clinicalTrialSearchQuery = async (): Promise<fhirclient.FHIR.Bundle> =>
  fetch('/api/clinical-trial-search').then(res => res.json());

export default clinicalTrialSearchQuery;
