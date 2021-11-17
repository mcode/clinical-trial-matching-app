import type { NextApiRequest, NextApiResponse } from 'next';
import mockSearchResults from '@/__mocks__/results.json';
import mockQueryBundle from '@/__mocks__/query.json';
import { Patient } from '@/utils/patient';
import { SearchParameters } from '@/utils/search_types';
import { Bundle, BundleEntry, Resource } from '@/utils/fhir-types';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { patient, user, search_params }= JSON.parse(req.body)
  
  // For now this is just the patient record.
  const entries:BundleEntry[] = [ { resource: patient.record }];

  const patientBundle:Bundle = buildBundle(search_params, entries);

  const chosen_services = ( typeof search_params["matchingServices"] != 'undefined' && search_params["matchingServices"] instanceof Array ) ? search_params["matchingServices"] : [search_params["matchingServices"]]
  const results = await callWrappers(chosen_services, patientBundle);
  console.log("Service results", results);
  res.status(200).json({ sp: search_params, patient, results});
};


function buildBundle(search_params: SearchParameters, entries: BundleEntry[]):Bundle {
  const trial_params:Resource = {
    resourceType: 'Parameters',
    id: '0',
    parameter: [
      ...(search_params['zipcode'] && [{ name: 'zipCode', valueString: search_params['zipcode'] }]),
      ...(search_params['travelDistance'] && [{ name: 'travelRadius', valueString: search_params['travelDistance'] }])
    ]
  }

  // Initialize a patient bundle with our search information.
  const patientBundle:Bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [ { resource: trial_params }]
  }

  entries.forEach((resource) => {
    patientBundle.entry.push({ ...(resource.fullUrl && {fullUrl: resource.fullUrl}), resource: resource.resource });
  });

  return patientBundle;
}

/**
 * 
 */
async function callWrappers(matchingServices: string[], query:Bundle) {
  // for now let's just have this list here
  const services = {
      "breastCancerTrials": { url: 'http://localhost:3001', search_route: '/getClinicalTrial' }, 
      "trialjectory": { url: 'http://localhost:3000', search_route: '/getClinicalTrial' },
      "trialscope": { url: 'http://localhost:3000', search_route: '/getClinicalTrial' },
  }

  const combined = await Promise.all(matchingServices.map(async (service) => {
    console.log(service);
    const results = await callWrapper(services[service].url + services[service].search_route, JSON.stringify(query, null, 2));
    // const results = await callWrapper(services[service].url + services[service].search_route, JSON.stringify(mockQueryBundle, null, 2))

    console.log("Results", results);
    return results;
  }));

  console.log(combined);
  return combined;
}

/**
 * 
 * @param url 
 * @param query 
 */
async function callWrapper(url:string, query: string) {
  console.log("url", url);
  console.log("query", query);

  return fetch(url, { cache: "no-store", method: "post", headers: {
    'Content-Type': 'application/json'
    }, body: query } ).then(response => response.json()).then(data => data);
}

// const

export default handler;
