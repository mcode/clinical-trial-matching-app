import type { NextApiRequest, NextApiResponse } from 'next';
import { SearchParameters } from '@/utils/search_types';
import { Bundle, BundleEntry, Resource } from '@/utils/fhir-types';

// Matching services and their information
const services = {
  breastCancerTrials: {
    service_name: 'Breast Cancer Trials',
    url: 'http://localhost:3001',
    search_route: '/getClinicalTrial',
  },
  trialjectory: { service_name: 'TrialJectory', url: 'http://localhost:3000', search_route: '/getClinicalTrial' },
  trialscope: { service_name: 'TrialScope', url: 'http://localhost:3000', search_route: '/getClinicalTrial' },
};

/**
 * API/Query handler For clinical-trial-search
 *
 * @param req Should contain { patient, user, search_params }
 * @param res Returns { results, errors }
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { patient, user, search_params } = JSON.parse(req.body);

  // For now this is just the patient record.
  const entries: BundleEntry[] = [{ resource: patient.record }];

  const patientBundle: Bundle = buildBundle(search_params, entries);

  const chosen_services =
    typeof search_params['matchingServices'] != 'undefined' && search_params['matchingServices'] instanceof Array
      ? search_params['matchingServices']
      : [search_params['matchingServices']];
  const results = await callWrappers(chosen_services, patientBundle);
  res.status(200).json(results);
};

/**
 * Builds bundle with search parameter and entries
 *
 * @param search_params
 * @param entries
 * @returns
 */
function buildBundle(search_params: SearchParameters, entries: BundleEntry[]): Bundle {
  const trial_params: Resource = {
    resourceType: 'Parameters',
    id: '0',
    parameter: [
      ...(search_params['zipcode'] && [{ name: 'zipCode', valueString: search_params['zipcode'] }]),
      ...(search_params['travelDistance'] && [{ name: 'travelRadius', valueString: search_params['travelDistance'] }]),
    ],
  };

  // Initialize a patient bundle with our search information.
  const patientBundle: Bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [{ resource: trial_params }],
  };

  entries.forEach(resource => {
    patientBundle.entry.push({ ...(resource.fullUrl && { fullUrl: resource.fullUrl }), resource: resource.resource });
  });

  return patientBundle;
}

/**
 * Calls all selected wrappers and combines the results
 *
 * @param matchingServices Selected matching services to use
 * @param query Query to be sent to all matching services
 * @returns Responses from called wrappers
 */
async function callWrappers(matchingServices: string[], query: Bundle) {
  const wrapper_results = await Promise.all(
    matchingServices.map(async service => {
      const results = await callWrapper(
        services[service].url + services[service].search_route,
        JSON.stringify(query, null, 2),
        services[service].service_name
      );

      return results;
    })
  );

  // Separate out responses that were unsuccessful
  const errors = wrapper_results.filter(result => result.status == 500);

  // Combine the responses that were successful
  const combined: Bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: 0,
    entry: [],
  };

  const successful = wrapper_results
    .filter(result => result.status == 200)
    .forEach(searchset => {
      // Each search set is also a Bundle so:
      combined.total += searchset.response.total || 0;
      combined.entry.push(...searchset.response.entry);
    });

  return { results: combined, errors };
}

/**
 * Calls a single wrapper
 *
 * @param url URL to send POST to
 * @param query Query to send to URL
 * @param service_name Name of the service
 * @returns Response from wrapper
 */
async function callWrapper(url: string, query: string, service_name: string) {
  console.log('url', url);
  console.log('query', query);

  return fetch(url, {
    cache: 'no-store',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: query,
  })
    .then(handleError)
    .then(response => response.json())
    .then(data => {
      return { status: 200, response: data };
    })
    .catch(error => {
      return { status: 500, response: 'There was an issue receiving responses from ' + service_name };
    });
}

/**
 * Throws an Error if status is not 2xx
 * @param response Wrapper response
 * @returns Response if 2xx
 */
function handleError(response) {
  if (!response.ok) {
    throw Error();
  }
  return response;
}

export default handler;
