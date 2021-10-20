import { fhirclient } from 'fhirclient/lib/types';

const clinicalTrialSearchQuery = async (patient, user, search_params): Promise<fhirclient.FHIR.Bundle> =>
  fetch('/api/clinical-trial-search', {  cache: "no-store", method: "post", body: JSON.stringify({ patient, user, search_params}, null, 2) }).then(res => res.json());

export default clinicalTrialSearchQuery;
