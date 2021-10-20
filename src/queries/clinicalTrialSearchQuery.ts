import { Bundle } from 'fhir/r4';

const clinicalTrialSearchQuery = async (): Promise<Bundle> =>
  fetch('/api/clinical-trial-search').then(res => res.json());

export default clinicalTrialSearchQuery;
