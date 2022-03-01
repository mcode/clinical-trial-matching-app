import type { NextApiRequest, NextApiResponse } from 'next';
import { SearchParameters } from 'types/search-types';
import { Bundle, Condition, Patient, Resource } from 'types/fhir-types';
import { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';
import { addCancerHistologyMorphology, addCancerType } from '@/utils/fhirFilter';
import { getStudyDetailProps } from '@/components/Results/utils';
import { StudyDetailProps } from '@/components/Results';
import { isAdministrativeGender } from '@/utils/fhirTypeGuards';

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
  const { searchParams } = JSON.parse(req.body);

  const patientBundle: Bundle = buildBundle(searchParams);

  const chosenServices =
    searchParams.matchingServices && Array.isArray(searchParams.matchingServices)
      ? searchParams.matchingServices
      : [searchParams.matchingServices];
  const results = await callWrappers(chosenServices, patientBundle);

  res.status(200).json(results);
};

function parseNamedSNOMEDCode(code: string): NamedSNOMEDCode {
  try {
    const result: NamedSNOMEDCode = JSON.parse(code);
    // Make sure this is valid
    return typeof result.display === 'string' && typeof result.code === 'string' ? result : undefined;
  } catch (ex) {
    // JSON parse error, return undefined
    return undefined;
  }
}

/**
 * Builds bundle with search parameter and entries
 *
 * @param searchParams
 * @returns
 */
function buildBundle(searchParams: SearchParameters): Bundle {
  const trialParams: Resource = {
    resourceType: 'Parameters',
    id: '0',
    parameter: [
      ...(searchParams['zipcode'] && [{ name: 'zipCode', valueString: searchParams['zipcode'] }]),
      ...(searchParams['travelDistance'] && [{ name: 'travelRadius', valueString: searchParams['travelDistance'] }]),
    ],
  };

  // Create our stub patient
  const patient: Patient = {
    resourceType: 'Patient',
    id: 'search_patient',
  };
  // Add whatever we can
  if (isAdministrativeGender(searchParams.gender)) {
    patient.gender = searchParams.gender;
  }
  if (searchParams.age) {
    const age = Number(searchParams.age);
    if (!isNaN(age)) {
      // For the age, calculate a year based on today's date and just store that. Just a year is a valid FHIR date.
      patient.birthDate = (new Date().getUTCFullYear() - age).toString();
    }
  }

  // Initialize a patient bundle with our search information.
  const patientBundle: Bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [{ resource: trialParams }, { resource: patient }],
  };

  // Now that we have the complete bundle, we can mutate if necessary from the search parameters. Restore the named
  // codes if they exist.
  const cancerType = parseNamedSNOMEDCode(searchParams['cancerType']);
  let cancerRecord: Condition;
  if (cancerType) {
    cancerRecord = addCancerType(patientBundle, cancerType);
  }
  const cancerSubtype = parseNamedSNOMEDCode(searchParams['cancerSubtype']);
  if (cancerSubtype) {
    addCancerHistologyMorphology(cancerRecord ? cancerRecord : patientBundle, cancerSubtype);
  }

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
  const combined: StudyDetailProps[] = [];

  // Grab the zipcode from the query
  const zipcode = query.entry[0].resource.parameter[0].valueString as string;

  wrapperResults
    .filter(result => result.status == 200)
    .forEach(searchset => {
      // Add the count to the total
      // Transform each of the studies in the bundle
      searchset?.response?.entry.forEach(entry => {
        combined.push(getStudyDetailProps(entry, zipcode));
      });
    });

  return { results: combined, errors };
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
      return {
        status: 500,
        response: 'There was an issue receiving responses from ' + serviceName,
        serviceName,
        error,
      };
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
