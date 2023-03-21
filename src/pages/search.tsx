import Header from '@/components/Header';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import {
  Biomarker,
  CodedValueType,
  convertFhirPatient,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  convertFhirUser,
  extractMedicationCodes,
  extractPrimaryCancerCondition,
  Patient,
  PrimaryCancerCondition,
  Score,
  User,
} from '@/utils/fhirConversionUtils';
import { Medication, MedicationRequest } from 'fhir/r4';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement } from 'react';

type SearchPageProps = {
  patient: Patient;
  user: User;
  primaryCancerCondition: PrimaryCancerCondition;
  metastasis: CodedValueType[];
  ecogScore: Score;
  karnofskyScore: Score;
  biomarkers: Biomarker[];
  radiation: CodedValueType[];
  surgery: CodedValueType[];
  medications: CodedValueType[];
};

const SearchPage = ({
  patient,
  user,
  primaryCancerCondition,
  metastasis,
  ecogScore,
  karnofskyScore,
  biomarkers,
  radiation,
  surgery,
  medications,
}: SearchPageProps): ReactElement => {
  const defaultValues = {
    age: patient.age || '',
    gender: patient.gender || 'unknown',
    cancerType: primaryCancerCondition ? primaryCancerCondition.cancerType : null,
    cancerSubtype: primaryCancerCondition ? primaryCancerCondition.cancerSubtype : null,
    stage: primaryCancerCondition ? primaryCancerCondition.stage : null,
    travelDistance: '100',
    zipcode: patient.zipcode || '',
    metastasis,
    ecogScore,
    karnofskyScore,
    biomarkers,
    radiation,
    surgery,
    medications,
  };

  return (
    <>
      <Head>
        <title>Search | Clinical Trial Finder</title>
      </Head>

      <Header userName={user?.name} />
      <PatientCard patient={patient} />
      <SearchForm defaultValues={defaultValues} />
    </>
  );
};

export default SearchPage;

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res } = context;

  let fhirClient: Client;
  try {
    fhirClient = await smart(req, res).ready();
  } catch (e) {
    return { props: {}, redirect: { destination: '/launch', permanent: false } };
  }

  const getResource = bundleMaker(fhirClient);
  const getCondition = getResource('Condition');
  const getObservation = getResource('Observation');
  const getProcedure = getResource('Procedure');
  const fhirPatient = await fhirClient.patient.read();
  const fhirUser = await fhirClient.user.read();
  const conditions = await getAllConditions(fhirClient);
  const procedures = await getAllProcedures(fhirClient);
  // const encounters = await getAllEncounters(fhirClient);
  const observations = await getAllObservations(fhirClient);
  const meds = await getAllMedications(fhirClient);
  //const fhirEcogPerformanceStatus  = await getMostRecentPerformacneValue(fhirClient,encounters,"EPIC#31000083940");
  //const fhirKarnofskyPerformanceStatus = await getMostRecentPerformacneValue(fhirClient,encounters,"EPIC#1500");
  // const

  /*console.log(`  === LOADED DATA ===
-- Conditions --
${JSON.stringify(conditions, null, 2)}

-- Procedures --
${JSON.stringify(procedures, null, 2)}

-- Medications --
${JSON.stringify(meds, null, 2)}

-- Observations --
${JSON.stringify(observations, null, 2)}
`);*/

  const [
    // fhirPrimaryCancerCondition,
    // fhirSecondaryCancerCondition,
    // fhirEcogPerformanceStatus,
    // fhirKarnofskyPerformanceStatus,
    // fhirTumorMarkers,
    // fhirRadiationProcedures,
    // fhirSurgeryProcedures,
    // fhirMedicationStatements,
  ] = await Promise.all([
    // getCondition(MCODE_PRIMARY_CANCER_CONDITION),
    // getCondition(MCODE_SECONDARY_CANCER_CONDITION),
    // getObservation(MCODE_ECOG_PERFORMANCE_STATUS),
    // getObservation(MCODE_KARNOFSKY_PERFORMANCE_STATUS),
    // getObservation(MCODE_TUMOR_MARKER),
    // getProcedure(MCODE_CANCER_RELATED_RADIATION_PROCEDURE),
    // getProcedure(MCODE_CANCER_RELATED_SURGICAL_PROCEDURE),
    // getMedicationStatement(MCODE_CANCER_RELATED_MEDICATION_STATEMENT),
  ]);
  const metastasis = convertFhirSecondaryCancerConditions(conditions);
  const primaryCancerCondition = extractPrimaryCancerCondition(conditions);

  const medications = extractMedicationCodes(meds);

  console.log('Primary ', primaryCancerCondition);
  console.log('Secondary ', metastasis);
  console.log('Medications ', medications);

  return {
    props: {
      patient: convertFhirPatient(fhirPatient),
      user: convertFhirUser(fhirUser),
      primaryCancerCondition: primaryCancerCondition,
      // metastasis: convertFhirSecondaryCancerConditions(fhirSecondaryCancerCondition),
      // ecogScore: convertFhirEcogPerformanceStatus(fhirEcogPerformanceStatus),
      // karnofskyScore: convertFhirKarnofskyPerformanceStatus(fhirKarnofskyPerformanceStatus),
      // biomarkers: convertFhirTumorMarkers(fhirTumorMarkers),
      radiation: convertFhirRadiationProcedures(procedures),
      surgery: convertFhirSurgeryProcedures(procedures),
      medications: medications,
    },
  };
};

// get conditions
// filter primary cancers
// metastisies
// get Observations
// get procedures
// get medications
// get encounters
// get sde observations
// filter ecog
// filter karnofsky

const getAllProcedures = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`Procedure?patient=${fhirClient.getPatientId()}`);
};

const getAllConditions = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`Condition?patient=${fhirClient.getPatientId()}`);
};

const getAllObservations = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(
    `Observation?patient=${fhirClient.getPatientId()}&category=laboratory`
  );
};

const getAllMedicationRequests = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`MedicationRequest?patient=${fhirClient.getPatientId()}`);
};

/**
 * Retrieves all known medications.
 * @param fhirClient the client to retrieve medications from
 */
const getAllMedications = async (fhirClient: Client): Promise<Medication[]> => {
  const medications: Promise<Medication>[] = [];
  const medicationRequestBundle = await getAllMedicationRequests(fhirClient);
  if (medicationRequestBundle.entry) {
    for (const entry of medicationRequestBundle.entry) {
      if (entry.resource && entry.resource.resourceType === 'MedicationRequest') {
        const medRequest = entry.resource as MedicationRequest;
        // See if this requires the medication be loaded separately
        if (medRequest.medicationReference && medRequest.medicationReference.reference) {
          // It does, so add the request
          medications.push(fhirClient.request<Medication>(medRequest.medicationReference.reference));
        } else if (medRequest.medicationCodeableConcept) {
          // Has the medication embedded
          medications.push(
            Promise.resolve({
              resourceType: 'Medication',
              code: medRequest.medicationCodeableConcept,
            })
          );
        }
      }
    }
  }
  return Promise.all(medications);
};

const getAllEncounters = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`Encounter?patient=${fhirClient.getPatientId()}`);
};

const getMostRecentPerformanceValue = async (fhirClient: Client, encounters: fhirclient.FHIR.Bundle, code: string) => {
  let returnBundle = null;
  const ecog = encounters.entry.find(async encounter => {
    let observations = await fhirClient.request<fhirclient.FHIR.Bundle>(
      `Observation?patient=${fhirClient.getPatientId()}&category=smartdata&focus=${encounter.id}&code=${code}`
    );
    if (observations.entry.length > 0 && observations.entry[0].resource.resourceType == 'Observation') {
      returnBundle = observations;
      return observations.entry[0].resource;
    }
    return false;
  });
  return returnBundle;
};

const bundleMaker = (fhirClient: Client) => {
  const urlPatientId = encodeURIComponent(fhirClient.getPatientId());
  return (resourceType: string) =>
    (url: string): Promise<fhirclient.FHIR.Bundle> =>
      fhirClient.request<fhirclient.FHIR.Bundle>(
        `${resourceType}?patient=${urlPatientId}&_profile=${encodeURIComponent(url)}`
      );
};
