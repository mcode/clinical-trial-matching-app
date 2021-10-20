import type { NextApiRequest, NextApiResponse } from 'next';
import mockSearchResults from '@/__mocks__/results.json';
import mockQueryBundle from '@/__mocks__/query.json';
import { Patient } from '@/utils/patient';
import { SearchParameters } from '@/utils/search_types';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { patient, user, search_params }= JSON.parse(req.body)
  
  const query = buildBundle(patient, search_params)
  const chosen_services = ( typeof search_params["matchingServices"] != 'undefined' && search_params["matchingServices"] instanceof Array ) ? search_params["matchingServices"] : [search_params["matchingServices"]]
  const results = await callWrappers(chosen_services, "");
  console.log("Service results", results);
  res.status(200).json({ sp: search_params, results});
  // res.status(200).json(null);
};


function buildBundle(patient: Patient, search_params: SearchParameters):String {
  return null;
}

/**
 * 
 */
async function callWrappers(matchingServices: string[], query: string) {
  // for now let's just have this list here
  const services = {
      "breastCancerTrials": { url: 'http://localhost:3001', search_route: '/getClinicalTrial' }, 
      "trialjectory": { url: 'http://localhost:3000', search_route: '/getClinicalTrial' },
      "trialscope": { url: 'http://localhost:3000', search_route: '/getClinicalTrial' },
  }

  const combined = await Promise.all(matchingServices.map(async (service) => {
    console.log(service);
    const results = await callWrapper(services[service].url + services[service].search_route, JSON.stringify(mockQueryBundle, null, 2))
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
  // fetch(url, { method: "post", body: query } ).then(res => { console.log("Res", JSON.stringify(res, null, 2)); res.json();});
  // return fetch("http://localhost:3200/api/mock-response", { method: "post", body: query } ).then(response => response.json())
  // .then(data => data);

    return fetch(url, { cache: "no-store", method: "post", headers: {
      'Content-Type': 'application/json'
      }, body: query } ).then(response => response.json()).then(data => data);
}

// const

export default handler;
