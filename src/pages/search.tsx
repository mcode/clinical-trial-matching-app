import Header from '@/components/Header';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
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
  convertFhirPrimaryCancerCondition,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  convertFhirTumorMarkers,
  convertFhirUser,
  Patient,
  PrimaryCancerCondition,
  Score,
  User,
} from '@/utils/fhirConversionUtils';
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
        `${resourceType}?patient=${urlPatientId}&_profile=${encodeURIComponent(url)}`
      );
};
