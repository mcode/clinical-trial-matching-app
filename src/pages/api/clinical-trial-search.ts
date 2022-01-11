import type { NextApiRequest, NextApiResponse } from 'next';
import { SearchParameters } from 'types/search-types';
import { Bundle, BundleEntry, Resource } from 'types/fhir-types';
import { ResearchStudy } from 'fhir/r4';
import { ContactProps } from '@/components/Results/types';
import { getContact } from '@/components/Results/utils';
import {
  getZipcodeCoordinates,
  getLocationsWithCoordinates,
  getCoordinatesOfClosestLocation,
  getDistanceBetweenPoints,
  coordinatesAreEqual,
} from '@/utils/distanceUtils';

const getClosestFacility = (study: ResearchStudy, zipcode: string): ContactProps => {
  const origin = getZipcodeCoordinates(zipcode);
  const locations = getLocationsWithCoordinates(study);
  const closest = getCoordinatesOfClosestLocation(origin, locations);
  const distance = getDistanceBetweenPoints(origin, closest);
  const location = closest && locations.find(coordinatesAreEqual(closest));
  return {
    ...getContact(location),
    distance: distance !== null ? `${distance} miles` : 'Unknown distance',
  };
};

// Matching services and their information
const services = {
  breastCancerTrials: {
    serviceName: 'Breast Cancer Trials',
    url: 'http://localhost:3001',
    searchRoute: '/getClinicalTrial',
  },
  trialjectory: { serviceName: 'TrialJectory', url: 'http://localhost:3000', searchRoute: '/getClinicalTrial' },
  trialscope: { serviceName: 'TrialScope', url: 'http://localhost:3000', searchRoute: '/getClinicalTrial' },
};

/**
 * API/Query handler For clinical-trial-search
 *
 * @param req Should contain { patient, user, searchParams }
 * @param res Returns { results, errors }
 */
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { patient, searchParams } = JSON.parse(req.body);

  // For now this is just the patient record.
  const entries: BundleEntry[] = [{ resource: patient.record }];

  const patientBundle: Bundle = buildBundle(searchParams, entries);

  const chosenServices =
    searchParams.matchingServices && Array.isArray(searchParams.matchingServices)
      ? searchParams.matchingServices
      : [searchParams.matchingServices];
  const results = await callWrappers(chosenServices, patientBundle);

  res.status(200).json(results);
};

/**
 * Builds bundle with search parameter and entries
 *
 * @param searchParams
 * @param entries
 * @returns
 */
function buildBundle(searchParams: SearchParameters, entries: BundleEntry[]): Bundle {
  const trialParams: Resource = {
    resourceType: 'Parameters',
    id: '0',
    parameter: [
      ...(searchParams['zipcode'] && [{ name: 'zipCode', valueString: searchParams['zipcode'] }]),
      ...(searchParams['travelDistance'] && [{ name: 'travelRadius', valueString: searchParams['travelDistance'] }]),
    ],
  };

  // Initialize a patient bundle with our search information.
  const patientBundle: Bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [{ resource: trialParams }],
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
  const wrapperResults = await Promise.all(
    matchingServices.map(async service => {
      const results = await callWrapper(
        services[service].url + services[service].searchRoute,
        JSON.stringify(query, null, 2),
        services[service].serviceName
      );

      return results;
    })
  );

  // Separate out responses that were unsuccessful
  const errors = wrapperResults.filter(result => result.status == 500);

  // Combine the responses that were successful
  const combined: Bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: 0,
    entry: [],
  };

  wrapperResults
    .filter(result => result.status == 200)
    .forEach(searchset => {
      // Each search set is also a Bundle so:
      combined.total += searchset.response.total || 0;
      combined.entry.push(...searchset.response.entry);
    });

  const zipcode = query.entry[0].resource.parameter[0].valueString as string;
  const closestFacilities: ContactProps[] = combined.entry?.map(({ resource }) =>
    getClosestFacility(resource as ResearchStudy, zipcode)
  );

  return { results: combined, errors, closestFacilities };
}

/**
 * Calls a single wrapper
 *
 * @param url URL to send POST to
 * @param query Query to send to URL
 * @param serviceName Name of the service
 * @returns Response from wrapper
 */
async function callWrapper(url: string, query: string, serviceName: string) {
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
      return { status: 500, response: 'There was an issue receiving responses from ' + serviceName, error };
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
