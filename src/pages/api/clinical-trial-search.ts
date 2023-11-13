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
  publicRuntimeConfig: { sendLocationData, defaultZipCode, defaultTravelDistance, reactAppDebug, resultsMax, services },
} = getConfig();

/**
 * API/Query handler For clinical-trial-search
 *
 * @param req Should contain { patient, user, searchParams }
 * @param res Returns { results, errors }
 */
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { searchParams } = JSON.parse(req.body);
  const mainCancerType: string = JSON.parse(searchParams.cancerType).cancerType[0];

  const patientBundle: Bundle = buildBundle(searchParams);

  const chosenServices =
    searchParams.matchingServices && Array.isArray(searchParams.matchingServices)
      ? searchParams.matchingServices
      : [searchParams.matchingServices];

  const results = await callWrappers(
    chosenServices,
    mainCancerType,
    patientBundle,
    searchParams['zipcode'],
    searchParams['travelDistance']
  );
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
async function callWrappers(
  matchingServices: string[],
  mainCancerType: string,
  query: Bundle,
  patientZipCode: string,
  travelDistance: string
) {
  const wrapperResults = await Promise.all(
    matchingServices.map(async name => {
      const { url, searchRoute, label, cancerTypes } = services.find((service: Service) => service.name === name);
      const results = cancerTypes.includes(mainCancerType)
        ? await callWrapper(url + searchRoute, JSON.stringify(query, null, 2), label)
        : { status: 200, response: { resourceType: 'Bundle', type: 'searchset', total: 0, entry: [] }, label };
      return results;
    })
  );

  // Separate out responses that were unsuccessful
  const errors = wrapperResults.filter(result => result.status == 500);

  // Process the responses that were succcessful
  const occurrences: { [key: string]: string[] } = {};
  const successfuResults = wrapperResults.filter(result => result.status == 200);
  const distanceFilteredResults = {};

  successfuResults.forEach(searchset => {
    const subset = [];
    searchset?.response?.entry.forEach((entry: BundleEntryWithStudy) => {
      const studyDetails: StudyDetailProps = getStudyDetailProps(entry, patientZipCode, searchset['serviceName']);

      // Function to determine if the results are within range
      const isStudyWithinRange = (entry: StudyDetailProps): boolean => {
        return (
          sendLocationData ||
          (entry.closestFacilities?.[0]?.distance?.quantity || 0) <= parseInt(travelDistance as string)
        );
      };

      // Special filter to check if valid under Ancora
      const isValidAncora = (entry: StudyDetailProps): boolean => {
        return !(
          entry.source == 'Ancora' &&
          ((mainCancerType == 'breast' && entry.likelihood.score < 0.5) ||
            (mainCancerType == 'prostate' && entry.likelihood.score < 0.3))
        );
      };

      // Only interested in Active and Interventional trials
      const isActiveAndInterventional = (entry: StudyDetailProps): boolean => {
        return (
          (entry.status?.label?.toLowerCase() == 'active' || entry.status?.name?.toLowerCase() == 'active') &&
          (entry.type?.label?.toLowerCase() == 'interventional' || entry.type?.name?.toLowerCase() == 'interventional')
        );
      };

      // Don't want to return NCT05885880 so just filter it out
      if (
        isStudyWithinRange(studyDetails) &&
        isValidAncora(studyDetails) &&
        isActiveAndInterventional(studyDetails) &&
        studyDetails.trialId != 'NCT05885880'
      ) {
        if (occurrences[studyDetails.trialId] === undefined) {
          subset.push(studyDetails);
          occurrences[studyDetails.trialId] = [searchset['serviceName']];
        } else if (!occurrences[studyDetails.trialId].includes(searchset['serviceName'])) {
          subset.push(studyDetails);
          occurrences[studyDetails.trialId].push(searchset['serviceName']);
        }
      }
    });

    distanceFilteredResults[searchset['serviceName']] = subset;
  });

  const sortByOccurence = (a: string[], b: string[]) => {
    return b[1].length - a[1].length;
  };

  // Cut this off at the max results anyways
  const trialCounts = Object.keys(occurrences)
    .map(key => [key, occurrences[key]])
    .sort(sortByOccurence)
    .filter(count => count[1].length > 1)
    .slice(0, resultsMax);

  // Go through the highest recurring trials first
  const results: StudyDetailProps[] = trialCounts.map((trialId: [string, string[]]) => {
    const services = trialId[1];
    const preferredService = services[0];
    const studyResult = distanceFilteredResults[preferredService].find(study => study.trialId == trialId[0]);

    // Change the sources to be all of the services that you saw this occurence for
    studyResult.source = services.join(', ');

    // Remove this trial as an option of trials from the distanceFilteredResults
    services.forEach(service => {
      const removalIndex = distanceFilteredResults[service].indexOf(item => item.trialId == trialId[0]);
      delete distanceFilteredResults[service][removalIndex];
    });

    return studyResult;
  });

  // Then if we haven't hit the max, keep adding round robin style from those that are left.
  // Keep track of number of consecutive failures.
  const validMatchingServices = Object.keys(distanceFilteredResults);
  let numOfFailures = 0;
  for (let i = results.length; i < resultsMax; i++) {
    // If we've hit the number of matchingServices in consecutive failures then we just don't have enough results to hit resultsMax.
    if (numOfFailures == validMatchingServices.length) break;
    const currentService = validMatchingServices[i % validMatchingServices.length];
    const study: StudyDetailProps = distanceFilteredResults[currentService].pop();

    if (study == undefined || study == null) {
      numOfFailures++;
    } else {
      numOfFailures = 0;
      results.push(study);
    }
  }

  return { results, errors };
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
  console.log('Grabbing Responses from: ', serviceName);
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
