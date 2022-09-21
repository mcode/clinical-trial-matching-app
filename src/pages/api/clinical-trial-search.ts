import { BundleEntry, StudyDetailProps } from '@/components/Results';
import { getStudyDetailProps } from '@/components/Results/utils';
import { Service } from '@/queries/clinicalTrialSearchQuery';
import {
  parseCodedValue as parseCodedValueType,
  parseCodedValueArray as parseCodedValueArray,
} from '@/utils/fhirConversionUtils';
import {
  addCancerHistologyMorphology,
  addCancerType,
  convertCodedValueToMedicationStatement as convertCodedValueToMedicationStatement,
  convertCodedValueToObervation as convertCodedValueTypeToObservation,
  convertStringToObservation,
} from '@/utils/fhirFilter';
import { isAdministrativeGender } from '@/utils/fhirTypeGuards';
import { MedicationStatement } from 'fhir/r4';
import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import * as fhirConstants from 'src/utils/fhirConstants';
import { Bundle, Condition, Observation, Patient, Resource } from 'types/fhir-types';
import { SearchParameters } from 'types/search-types';

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
  const cancerType = parseCodedValueType(searchParams['cancerType']);
  let cancerRecord: Condition;
  if (cancerType) {
    cancerRecord = addCancerType(patientBundle, cancerType);
  }
  const cancerSubtype = parseCodedValueType(searchParams['cancerSubtype']);
  if (cancerSubtype) {
    addCancerHistologyMorphology(cancerRecord ? cancerRecord : patientBundle, cancerSubtype);
  }

  const ecogScore = searchParams['ecogScore'];
  if (ecogScore != null) {
    // NOSONAR
    const id = 'mcode-ecog-performance-status';
    const profileValue = fhirConstants.MCODE_ECOG_PERFORMANCE_STATUS;
    const codingSystem = 'http://loinc.org';
    const codingSystemCode = '89247-1';
    const resource: Observation = convertStringToObservation({
      valueString: ecogScore,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
    patientBundle.entry.push({ resource: resource });
  }

  const karnofskyScore = searchParams.karnofskyScore;
  if (karnofskyScore) {
    // NOSONAR
    const id = 'mcode-karnofsky-performance-status';
    const profileValue = fhirConstants.MCODE_KARNOFSKY_PERFORMANCE_STATUS;
    const codingSystem = 'http://loinc.org';
    const codingSystemCode = 'LL4986-7';

    const resource: Observation = convertStringToObservation({
      valueString: karnofskyScore,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
    patientBundle.entry.push({ resource: resource });
  }

  if (searchParams.stage.length > 0) {
    // NOSONAR
    const id = 'mcode-cancer-stage-group';
    const profileValue = fhirConstants.MCODE_CANCER_STAGE_GROUP;
    const codingSystem = 'http://snomed.info/sct';
    const stageParm = parseCodedValueType(searchParams.stage);
    const resource = convertCodedValueTypeToObservation({
      codedValue: stageParm,
      id,
      profile_value: profileValue,
      codingSystem,
    });
    patientBundle.entry.push({ resource: resource });
  }

  const metastasisParm = searchParams.metastasis;

  if (metastasisParm) {
    // NOSONAR
    const id = 'tnm-clinical-distant-metastases-category-cM0';
    const profileValue = fhirConstants.MCODE_CLINICAL_DISTANT_METASTASIS;
    const codingSystem: string = null;
    const codingSystemCode: string = null;

    const resource = convertStringToObservation({
      valueString: metastasisParm,
      id,
      profile_value: profileValue,
      codingSystem,
      codingSystemCode,
    });
    patientBundle.entry.push({ resource: resource });
  }

  const biomarkersVals = parseCodedValueArray(searchParams['biomarkers']);
  if (searchParams.biomarkers.length > 0) {
    // NOSONAR
    const profileValue = fhirConstants.MCODE_TUMOR_MARKER;
    const codingSystem = 'http://snomed.info/sct';
    for (const bioMarkers of biomarkersVals) {
      const resource = convertCodedValueTypeToObservation({
        codedValue: bioMarkers,
        id,
        profile_value: profileValue,
        codingSystem,
      });
      patientBundle.entry.push({ resource: resource });
    }
  }

  const medications = parseCodedValueArray(searchParams['medications']);
  if (searchParams.medications.length > 0) {
    // NOSONAR
    const id = 'mcode-cancer-related-medication-statement';
    const profileValue = fhirConstants.MCODE_CANCER_RELATED_MEDICATION_STATEMENT;
    const codingSystem = 'http://www.nlm.nih.gov/research/umls/rxnorm';
    for (const medication of medications) {
      const resource: MedicationStatement = convertCodedValueToMedicationStatement({
        codedValue: medication,
        id,
        profile_value: profileValue,
        codingSystem,
      });

      patientBundle.entry.push({ resource: resource });
    }
  }
  const surgeryVals = parseCodedValueArray(searchParams['surgery']);
  if (searchParams.surgery.length > 0) {
    // NOSONAR
    const id = 'mcode-cancer-related-surgical-procedure';
    const profileValue = fhirConstants.MCODE_CANCER_RELATED_SURGICAL_PROCEDURE;
    const codingSystem = 'http://snomed.info/sct';
    for (const surgery of surgeryVals) {
      const resource = convertCodedValueTypeToObservation({
        codedValue: surgery,
        id,
        profile_value: profileValue,
        codingSystem,
      });
      patientBundle.entry.push({ resource: resource });
    }
  }

  const radiationVals = parseCodedValueArray(searchParams['radiation']);
  if (searchParams.surgery.length > 0) {
    // NOSONAR
    const id = 'mcode-cancer-related-radiation-procedure';
    const profileValue = fhirConstants.MCODE_CANCER_RELATED_RADIATION_PROCEDURE;
    const codingSystem = 'http://snomed.info/sct';
    for (const radiation of radiationVals) {
      const resource = convertCodedValueTypeToObservation({
        codedValue: radiation,
        id,
        profile_value: profileValue,
        codingSystem,
      });
      patientBundle.entry.push({ resource: resource });
    }
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
