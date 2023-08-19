import { BundleEntry as BundleEntryWithStudy, StudyDetailProps } from '@/components/Results';
import { getStudyDetailProps } from '@/components/Results/utils';
import { Service } from '@/queries/clinicalTrialSearchQuery';
import { Biomarker, CodedValueType, Score } from '@/utils/fhirConversionUtils';
import {
  getCancerRelatedMedicationStatement,
  getCancerRelatedRadiationProcedure,
  getCancerRelatedSurgicalProcedure,
  getClinicalStageGroup,
  getEcogPerformanceStatus,
  getHistologyMorphologyBehavior,
  getKarnofskyPerformanceStatus,
  getPrimaryCancerCondition,
  getSecondaryCancerCondition,
  getTumorMarker,
  resourceToEntry,
} from '@/utils/fhirFilter';
import { isAdministrativeGender } from '@/utils/fhirTypeGuards';
import type { Bundle, BundleEntry, Parameters, Patient } from 'fhir/r4';
import { nanoid } from 'nanoid';
import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { SearchParameters } from 'types/search-types';

const {
  publicRuntimeConfig: { sendLocationData, defaultZipCode, defaultTravelDistance, reactAppDebug, services },
} = getConfig();

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

  const results = await callWrappers(chosenServices, patientBundle, searchParams['zipcode']);
  res.status(200).json(results);
};

/**
 * Builds bundle with search parameter and entries
 *
 * @param searchParams search parameters
 * @param id optional ID to override the generated ID (mainly for tests)
 * @returns
 */
export function buildBundle(searchParams: SearchParameters, id?: string): Bundle {
  const zipCode = sendLocationData ? searchParams['zipcode'] : defaultZipCode;
  const travelDistance = sendLocationData ? searchParams['travelDistance'] : defaultTravelDistance;

  !sendLocationData && console.log(`Using default zip code ${defaultZipCode} and travel distance ${travelDistance}`);

  const trialParams: Parameters = {
    resourceType: 'Parameters',
    id: '0',
    parameter: [
      ...(zipCode ? [{ name: 'zipCode', valueString: zipCode }] : []),
      ...(travelDistance ? [{ name: 'travelRadius', valueString: travelDistance }] : []),
    ],
  };

  if (!id) {
    id = nanoid();
  }

  // Create our stub patient
  const patient: Patient = { resourceType: 'Patient', id: id };

  // Add whatever we can
  if (isAdministrativeGender(searchParams.gender)) {
    patient.gender = searchParams.gender;
  }
  if (searchParams.age) {
    const age = Number(searchParams.age);
    if (!isNaN(age)) {
      // For the age, calculate a year based on today's date and just store that. Just a year is a valid FHIR date.
      patient.birthDate = (new Date().getUTCFullYear() - Math.min(age, 90)).toString();
    }
  }

  // Initialize a patient bundle with our search information.
  const patientBundle: Bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [{ resource: trialParams }, { resource: patient, fullUrl: 'urn:uuid:' + id }],
  };

  const entries = getOPDEValues(searchParams, patient.id);
  patientBundle.entry = [...patientBundle.entry, ...entries];

  if (reactAppDebug) {
    console.log(JSON.stringify(patientBundle, null, 2));
  }

  return patientBundle;
}

/**
 * Calls all selected wrappers and combines the results
 *
 * @param matchingServices Selected matching services to use
 * @param query Query to be sent to all matching services
 * @param patientZipCode Patient's zip code which may not have been sent to matching services
 * @returns Responses from called wrappers
 */
async function callWrappers(matchingServices: string[], query: Bundle, patientZipCode: string) {
  const wrapperResults = await Promise.all(
    matchingServices.map(async name => {
      const { url, searchRoute, label } = services.find((service: Service) => service.name === name);
      const results = await callWrapper(url + searchRoute, JSON.stringify(query, null, 2), label);
      return results;
    })
  );

  // Separate out responses that were unsuccessful
  const errors = wrapperResults.filter(result => result.status == 500);

  // Combine the responses that were successful
  const uniqueTrials: { [key: string]: StudyDetailProps } = {};

  wrapperResults
    .filter(result => result.status == 200)
    .forEach(searchset => {
      // Add the count to the total
      // Transform each of the studies in the bundle
      searchset?.response?.entry.forEach((entry: BundleEntryWithStudy) => {
        const otherTrialId = entry.resource.identifier?.[0]?.value;
        const isUniqueTrial = uniqueTrials[otherTrialId] === undefined;
        // Don't want to return NCT05885880 so just filter it out
        if (isUniqueTrial && otherTrialId != 'NCT05885880') {
          uniqueTrials[otherTrialId] = getStudyDetailProps(entry, patientZipCode, searchset['serviceName']);
        } else {
          uniqueTrials[otherTrialId].source += ', ' + searchset['serviceName'];
        }
      });
    });

  return { results: Object.values(uniqueTrials), errors };
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
      return { status: 200, response: data, serviceName };
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

const getParsedParameters = (
  parameters: SearchParameters
): Partial<
  Record<keyof Pick<SearchParameters, 'cancerType' | 'cancerSubtype' | 'stage'>, CodedValueType> &
    Record<keyof Pick<SearchParameters, 'metastasis' | 'surgery' | 'medications' | 'radiation'>, CodedValueType[]> &
    Record<keyof Pick<SearchParameters, 'biomarkers'>, Biomarker[]> &
    Record<keyof Pick<SearchParameters, 'ecogScore' | 'karnofskyScore'>, Score>
> => {
  return {
    ...(!!parameters.cancerType ? { cancerType: JSON.parse(parameters.cancerType) } : {}),
    ...(!!parameters.cancerSubtype ? { cancerSubtype: JSON.parse(parameters.cancerSubtype) } : {}),
    ...(!!parameters.metastasis ? { metastasis: JSON.parse(parameters.metastasis) } : {}),
    ...(!!parameters.stage ? { stage: JSON.parse(parameters.stage) } : {}),
    ...(!!parameters.ecogScore ? { ecogScore: JSON.parse(parameters.ecogScore) } : {}),
    ...(!!parameters.karnofskyScore ? { karnofskyScore: JSON.parse(parameters.karnofskyScore) } : {}),
    ...(!!parameters.biomarkers ? { biomarkers: JSON.parse(parameters.biomarkers) } : {}),
    ...(!!parameters.surgery ? { surgery: JSON.parse(parameters.surgery) } : {}),
    ...(!!parameters.medications ? { medications: JSON.parse(parameters.medications) } : {}),
    ...(!!parameters.radiation ? { radiation: JSON.parse(parameters.radiation) } : {}),
  };
};

const getOPDEValues = (parameters: SearchParameters, patientId: string): BundleEntry[] => {
  const {
    cancerType,
    cancerSubtype,
    metastasis: metastases,
    stage,
    ecogScore,
    karnofskyScore,
    biomarkers,
    surgery: surgeries,
    medications,
    radiation: radiations,
  } = getParsedParameters(parameters);
  const histologyMorphology = getHistologyMorphologyBehavior(cancerSubtype);
  const entries = [
    getPrimaryCancerCondition({ cancerType, histologyMorphology, patientId }),
    getEcogPerformanceStatus({ ecogScore, patientId }),
    getKarnofskyPerformanceStatus({ karnofskyScore, patientId }),
    getClinicalStageGroup({ stage, patientId }),
    ...biomarkers.map(biomarker => getTumorMarker({ biomarker, patientId })),
    ...medications.map(medication => getCancerRelatedMedicationStatement({ medication, patientId })),
    ...metastases.map(cancerType => getSecondaryCancerCondition({ cancerType, patientId })),
    ...radiations.map(radiation => getCancerRelatedRadiationProcedure({ radiation, patientId })),
    ...surgeries.map(surgery => getCancerRelatedSurgicalProcedure({ surgery, patientId })),
  ]
    .filter(resource => !!resource)
    .map(resourceToEntry);

  return entries;
};

export default handler;
