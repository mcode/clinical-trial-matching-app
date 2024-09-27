import Header from '@/components/Header';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { UserIdContext } from '@/components/UserIdContext';
import { fetchPatientData } from '@/utils/fetchPatientData';
import { Biomarker, CodedValueType, Patient, PrimaryCancerCondition, Score, User } from '@/utils/fhirConversionUtils';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Head from 'next/head';
import React, { ReactElement, useState } from 'react';
import { GetConfig } from 'types/config';

type SearchPageProps = {
  patient: Patient;
  user?: User;
  primaryCancerCondition: PrimaryCancerCondition;
  diseaseStatus: CodedValueType;
  metastasis: CodedValueType[];
  primaryTumorStage: CodedValueType;
  nodalDiseaseStage: CodedValueType;
  metastasesStage: CodedValueType;
  ecogScore: Score;
  karnofskyScore: Score;
  biomarkers: Biomarker[];
  radiation: CodedValueType[];
  surgery: CodedValueType[];
  medications: CodedValueType[];
};

const {
  publicRuntimeConfig: {
    disableSearchLocation,
    defaultSearchZipCode,
    defaultSearchTravelDistance,
    fhirQueryFlavor,
    fhirlessPatient,
  },
} = getConfig() as GetConfig;

const SearchPage = ({
  patient,
  user,
  primaryCancerCondition,
  diseaseStatus,
  primaryTumorStage,
  nodalDiseaseStage,
  metastasesStage,
  metastasis,
  ecogScore,
  karnofskyScore,
  biomarkers,
  radiation,
  surgery,
  medications,
}: SearchPageProps): ReactElement => {
  const defaultValues = {
    age: patient?.age || '',
    gender: patient?.gender || 'unknown',
    cancerType: primaryCancerCondition?.cancerType ?? null,
    cancerSubtype: primaryCancerCondition?.cancerSubtype ?? null,
    diseaseStatus: diseaseStatus ?? null,
    stage: primaryCancerCondition?.stage ?? null,
    primaryTumorStage: primaryTumorStage ?? null,
    nodalDiseaseStage: nodalDiseaseStage ?? null,
    metastasesStage: metastasesStage ?? null,
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

  return (
    <>
      <Head>
        <title>Search | Clinical Trial Finder</title>
      </Head>

      <Header userName={user?.name} />
      <PatientCard patient={patient} />
      <UserIdContext.Provider value={userId}>
        <SearchForm defaultValues={defaultValues} setUserId={setUserId} disableLocation={disableSearchLocation} />
      </UserIdContext.Provider>
    </>
  );
};

export default SearchPage;

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res } = context;
  // FIXME: Next.js 13 broke something, see https://github.com/vercel/next.js/issues/57397
  // For now, remove the x-forwarded headers, they break fhirclient
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-port'];
  delete req.headers['x-forwarded-proto'];
  delete req.headers['x-forwarded-for'];

  // See if this has been told to ignore the FHIR client
  // This is mostly for testing that the system is otherwise up and running
  if (context.query['fhirless'] !== undefined) {
    // In this case, the search form is "fhirless" and we return a default set of properties
    return {
      props: {
        // Patient data is currently configured in .env
        patient: fhirlessPatient,
        user: {
          id: 'example',
          name: 'example',
          record: null,
        },
        primaryCancerCondition: null,
        diseaseStatus: null,
        primaryTumorStage: null,
        nodalDiseaseStage: null,
        metastasesStage: null,
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

  console.log('Fetching patient data using %s FHIR flavor', fhirQueryFlavor);

  // Now that we have that, we can load the patient data
  return {
    props: await fetchPatientData(fhirClient, fhirQueryFlavor),
  };
};
