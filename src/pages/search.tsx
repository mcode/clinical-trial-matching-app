import Header from '@/components/Header';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { convertEcogScore, convertKarnofskyScore } from '@/utils/epicEHRConverters';
import { getMostRecentPerformanceValue } from '@/utils/epicPatientDataLoader';
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
import { getAllConditions, getAllEncounters, getAllMedications, getAllProcedures } from '@/utils/patientDataLoader';
import { Observation } from 'fhir/r4';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
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

  const fhirPatient = await fhirClient.patient.read();
  const fhirUser = await fhirClient.user.read();

  const conditions = await getAllConditions(fhirClient);
  const procedures = await getAllProcedures(fhirClient);
  const encounters = await getAllEncounters(fhirClient);
  // const observations = await getAllObservations(fhirClient);
  const meds = await getAllMedications(fhirClient);

  const fhirEcogPerformanceStatus = await getMostRecentPerformanceValue(fhirClient, encounters, 'EPIC#31000083940');
  const fhirKarnofskyPerformanceStatus = await getMostRecentPerformanceValue(fhirClient, encounters, 'EPIC#1500');

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
      // Conversion is "safe" as convertEcogScore will reject bad values
      ecogScore: convertEcogScore(fhirEcogPerformanceStatus as Observation),
      karnofskyScore: convertKarnofskyScore(fhirKarnofskyPerformanceStatus as Observation),
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
