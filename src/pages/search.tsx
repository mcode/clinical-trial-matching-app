import Header from '@/components/Header';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { UserIdContext } from '@/components/UserIdContext';
import {
  MCODE_CANCER_RELATED_MEDICATION_STATEMENT,
  MCODE_CANCER_RELATED_RADIATION_PROCEDURE,
  MCODE_CANCER_RELATED_SURGICAL_PROCEDURE,
  MCODE_ECOG_PERFORMANCE_STATUS,
  MCODE_KARNOFSKY_PERFORMANCE_STATUS,
  MCODE_PRIMARY_CANCER_CONDITION,
  MCODE_SECONDARY_CANCER_CONDITION,
  MCODE_TUMOR_MARKER,
} from '@/utils/fhirConstants';
import {
  Biomarker,
  CodedValueType,
  convertFhirEcogPerformanceStatus,
  convertFhirKarnofskyPerformanceStatus,
  convertFhirMedicationStatements,
  convertFhirPatient,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  convertFhirTumorMarkers,
  convertFhirUser,
  extractPrimaryCancerCondition,
  Patient,
  PrimaryCancerCondition,
  Score,
  User,
} from '@/utils/fhirConversionUtils';
import { fhirMedicationStatementBundle, fhirTumorMarkerBundle } from '@/__mocks__/bundles';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Head from 'next/head';
import React, { ReactElement, useState } from 'react';

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

const {
  publicRuntimeConfig: { disableSearchLocation, defaultSearchZipCode, defaultSearchTravelDistance },
} = getConfig();

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
    cancerType: primaryCancerCondition.cancerType,
    cancerSubtype: primaryCancerCondition.cancerSubtype,
    stage: primaryCancerCondition.stage,
    travelDistance: defaultSearchTravelDistance || '100',
    zipcode: disableSearchLocation ? defaultSearchZipCode : patient.zipcode || (defaultSearchZipCode ?? ''),
    metastasis,
    ecogScore,
    karnofskyScore,
    biomarkers,
    radiation,
    surgery,
    medications,
  };
  const [userId, setUserId] = useState<string | null>(null);

  // for debugging purposes
  if (true) {
    convertFhirMedicationStatements(fhirMedicationStatementBundle);
    convertFhirTumorMarkers(fhirTumorMarkerBundle);
  }

  return (
    <>
      <Head>
        <title>Search | Clinical Trial Finder</title>
      </Head>

      <Header userName={user?.name} />
      <PatientCard patient={patient} />
      <UserIdContext.Provider value={userId}>
        <SearchForm defaultValues={defaultValues} disableLocation={disableSearchLocation} setUserId={setUserId} />
      </UserIdContext.Provider>
    </>
  );
};

export default SearchPage;

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res } = context;

  // See if this has been told to ignore the FHIR client
  // This is mostly for testing that the system is otherwise up and running
  if (context.query['fhirless'] !== undefined) {
    // In this case, the search form is "fhirless" and we return a default set of properties
    return {
      props: {
        patient: {
          id: 'example',
          name: 'Test Launch',
          // Gender can't currently be user-set
          gender: 'male',
          // Age can't currently be user-set
          age: 35,
          zipcode: null,
        },
        user: {
          id: 'example',
          name: 'example',
          record: null,
        },
        primaryCancerCondition: null,
        ecogScore: null,
        karnofskyScore: null,
        radiation: [],
        surgery: [],
        medications: [],
      },
    };
  }
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
  const getMedicationStatement = getResource('MedicationStatement');

  const [
    fhirPatient,
    fhirUser,
    fhirPrimaryCancerCondition,
    fhirSecondaryCancerCondition,
    fhirEcogPerformanceStatus,
    fhirKarnofskyPerformanceStatus,
    fhirTumorMarkers,
    fhirRadiationProcedures,
    fhirSurgeryProcedures,
    fhirMedicationStatements,
  ] = await Promise.all([
    fhirClient.patient.read(),
    fhirClient.user.read(),
    getCondition(MCODE_PRIMARY_CANCER_CONDITION),
    getCondition(MCODE_SECONDARY_CANCER_CONDITION),
    getObservation(MCODE_ECOG_PERFORMANCE_STATUS),
    getObservation(MCODE_KARNOFSKY_PERFORMANCE_STATUS),
    getObservation(MCODE_TUMOR_MARKER),
    getProcedure(MCODE_CANCER_RELATED_RADIATION_PROCEDURE),
    getProcedure(MCODE_CANCER_RELATED_SURGICAL_PROCEDURE),
    getMedicationStatement(MCODE_CANCER_RELATED_MEDICATION_STATEMENT),
  ]);

  return {
    props: {
      patient: convertFhirPatient(fhirPatient),
      user: convertFhirUser(fhirUser),
      primaryCancerCondition: extractPrimaryCancerCondition(fhirPrimaryCancerCondition),
      metastasis: convertFhirSecondaryCancerConditions(fhirSecondaryCancerCondition),
      ecogScore: convertFhirEcogPerformanceStatus(fhirEcogPerformanceStatus),
      karnofskyScore: convertFhirKarnofskyPerformanceStatus(fhirKarnofskyPerformanceStatus),
      biomarkers: convertFhirTumorMarkers(fhirTumorMarkers),
      radiation: convertFhirRadiationProcedures(fhirRadiationProcedures),
      surgery: convertFhirSurgeryProcedures(fhirSurgeryProcedures),
      medications: convertFhirMedicationStatements(fhirMedicationStatements),
    },
  };
};

const bundleMaker = (fhirClient: Client) => {
  const urlPatientId = encodeURIComponent(fhirClient.getPatientId());
  return (resourceType: string) =>
    (url: string): Promise<fhirclient.FHIR.Bundle> =>
      fhirClient.request<fhirclient.FHIR.Bundle>(
        `${resourceType}?patient=${urlPatientId}&_profile=${encodeURIComponent(url)}`
      );
};
