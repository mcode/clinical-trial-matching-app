import type { NextApiRequest, NextApiResponse } from 'next';
import { SearchParameters } from 'types/search-types';
import { Bundle, Condition, Patient, Resource } from 'types/fhir-types';
import { parseNamedSNOMEDCode } from '@/utils/fhirConversionUtils';
import { addCancerHistologyMorphology, convertStringtoResource, addCancerType } from '@/utils/fhirFilter';
import { getStudyDetailProps } from '@/components/Results/utils';
import { BundleEntry, StudyDetailProps } from '@/components/Results';
import { isAdministrativeGender } from '@/utils/fhirTypeGuards';
import * as fhirConstants from 'src/utils/fhirConstants';
import getConfig from 'next/config';
import { Service } from '@/queries/clinicalTrialSearchQuery';

const {
  publicRuntimeConfig: { sendLocationData, defaultZipCode, reactAppDebug, services },
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
 * @param searchParams
 * @returns
 */
function buildBundle(searchParams: SearchParameters): Bundle {
  const zipCode = sendLocationData ? searchParams['zipcode'] : defaultZipCode;
  const travelDistance = sendLocationData ? searchParams['travelDistance'] : undefined;

  !sendLocationData && console.log(`Using default zip code ${defaultZipCode} and travel distance ${travelDistance}`);

  const trialParams: Resource = {
    resourceType: 'Parameters',
    id: '0',
    parameter: [
      ...(zipCode ? [{ name: 'zipCode', valueString: zipCode }] : []),
      ...(travelDistance ? [{ name: 'travelRadius', valueString: travelDistance }] : []),
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

  const ecogScore = searchParams['ecogScore'];
  if (ecogScore != null) {
    const id = 'mcode-ecog-performance-status';
    const profileValue = fhirConstants.MCODE_ECOG_PERFORMANCE_STATUS;
    const codingSystem = 'http://loinc.org';
    const codingSystemCode = '89247-1';
    convertStringtoResource({
      bundle: patientBundle,
      valueString: ecogScore,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
  }

  const karnofskyScore = searchParams.karnofskyScore;
  if (karnofskyScore) {
    const id = 'mcode-karnofsky-performance-status';
    const profileValue = fhirConstants.MCODE_KARNOFSKY_PERFORMANCE_STATUS;
    const codingSystem = 'http://loinc.org';
    const codingSystemCode = 'LL4986-7';

    convertStringtoResource({
      bundle: patientBundle,
      valueString: karnofskyScore,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
  }

  const stageParm = searchParams.stage;
  if (stageParm != null) {
    const id = 'mcode-cancer-stage-group';
    const profileValue = fhirConstants.MCODE_CANCER_STAGE_GROUP;
    const codingSystem = 'http://loinc.org';
    const codingSystemCode = '21914-7';
    convertStringtoResource({
      bundle: patientBundle,
      valueString: stageParm,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
  }

  const metastasisParm = searchParams.metastasis;

  if (metastasisParm) {
    const id = 'tnm-clinical-distant-metastases-category-cM0';
    const profileValue = fhirConstants.MCODE_CLINICAL_DISTANT_METASTASIS;
    const codingSystem: string = null;
    const codingSystemCode: string = null;
    convertStringtoResource({
      bundle: patientBundle,
      valueString: stageParm,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
  }

  const bioMarkersParm = searchParams.biomarkers;
  if (bioMarkersParm) {
    const id = 'mcode-tumor-marker';
    const profileValue = fhirConstants.MCODE_TUMOR_MARKER;
    const codingSystem = 'http://loinc.org';
    const codingSystemCode = '21907-1';
    convertStringtoResource({
      bundle: patientBundle,
      valueString: metastasisParm,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
  }
  const medicationsParm = searchParams.medications;
  if (medicationsParm) {
    const id = 'mcode-cancer-related-medication-statement';
    const profileValue = fhirConstants.MCODE_CANCER_RELATED_MEDICATION_STATEMENT;
    const codingSystem = '';
    const codingSystemCode = '';
    convertStringtoResource({
      bundle: patientBundle,
      valueString: medicationsParm,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
  }

  const surgeryParm = searchParams.surgery;
  if (surgeryParm) {
    const id = 'mcode-cancer-related-surgical-procedure';
    const profileValue = fhirConstants.MCODE_CANCER_RELATED_SURGICAL_PROCEDURE;
    const codingSystem = '';
    const codingSystemCode = '';
    convertStringtoResource({
      bundle: patientBundle,
      valueString: surgeryParm,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
  }

  const radiationParm = searchParams.radiation;
  if (surgeryParm) {
    const id = 'mcode-cancer-related-radiation-procedure';
    const profileValue = fhirConstants.MCODE_CANCER_RELATED_SURGICAL_PROCEDURE;
    const codingSystem = '';
    const codingSystemCode = '';
    convertStringtoResource({
      bundle: patientBundle,
      valueString: radiationParm,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
  }
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
  const combined: StudyDetailProps[] = [];
  const uniqueTrialIds = new Set<string>();

  wrapperResults
    .filter(result => result.status == 200)
    .forEach(searchset => {
      // Add the count to the total
      // Transform each of the studies in the bundle
      searchset?.response?.entry.forEach((entry: BundleEntry) => {
        const otherTrialId = entry.resource.identifier?.[0]?.value;
        const foundDuplicateTrial = uniqueTrialIds.has(otherTrialId);
        if (!foundDuplicateTrial) {
          uniqueTrialIds.add(otherTrialId);
          combined.push(getStudyDetailProps(entry, patientZipCode));
        }
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
