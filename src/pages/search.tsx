import Header from '@/components/Header';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { MCODE_STRUCTURE_DEFINITION } from '@/utils/fhirConstants';
import {
  convertFhirEcogPerformanceStatus,
  convertFhirKarnofskyPerformanceStatus,
  convertFhirMedicationStatements,
  convertFhirPatient,
  convertFhirPrimaryCancerCondition,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  convertFhirTumorMarkers,
  convertFhirUser,
  Patient,
  PrimaryCancerCondition,
  User,
} from '@/utils/fhirConversionUtils';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Head from 'next/head';
import { ReactElement } from 'react';
import * as developmentModeProps from '../../cypress/fixtures/searchServerSideProps.json';
const {
  publicRuntimeConfig: { inDevelopmentMode },
} = getConfig();

type SearchPageProps = {
  patient: Patient;
  user: User;
  primaryCancerCondition: PrimaryCancerCondition;
  metastasis: string[];
  ecogScore: string;
  karnofskyScore: string;
  biomarkers: string[];
  radiation: string[];
  surgery: string[];
  medications: string[];
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
    cancerType: primaryCancerCondition.cancerType,
    cancerSubtype: primaryCancerCondition.cancerSubtype,
    stage: primaryCancerCondition.stage,
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
  // if you're in testing env just return static values rather than actually mock out fhirclient. arguably you'd want to test out the methods. easier to mock out client there
  if (inDevelopmentMode) {
    // return { ...developmentModeProps, redirect: { destination: '/launch', permanent: false } };
    return developmentModeProps;
  }

  const { req, res } = context;

  let fhirClient: Client;
  try {
    // possibly stub this out in testing, for Cypress?
    // fhirclient stuff might all run in the server
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
    getCondition('mcode-primary-cancer-condition'),
    getCondition('mcode-secondary-cancer-condition'),
    getObservation('mcode-ecog-performance-status'),
    getObservation('mcode-karnofsky-performance-status'),
    getObservation('mcode-tumor-marker'),
    getProcedure('mcode-cancer-related-radiation-procedure'),
    getProcedure('mcode-cancer-related-surgical-procedure'),
    getMedicationStatement('mcode-cancer-related-medication-statement'),
  ]);

  return {
    props: {
      patient: convertFhirPatient(fhirPatient),
      user: convertFhirUser(fhirUser),
      primaryCancerCondition: convertFhirPrimaryCancerCondition(fhirPrimaryCancerCondition),
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
        `${resourceType}?patient=${urlPatientId}&_profile=${encodeURIComponent(MCODE_STRUCTURE_DEFINITION + url)}`
      );
};
