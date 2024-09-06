import Header from '@/components/Header';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { UserIdContext } from '@/components/UserIdContext';
import { fetchPatientData } from '@/utils/fetchPatientData';
import {
  Biomarker,
  CodedValueType,
  convertFhirMedicationStatements,
  convertFhirTumorMarkers,
  Patient,
  PrimaryCancerCondition,
  Score,
  User,
} from '@/utils/fhirConversionUtils';
import { fhirMedicationStatementBundle, fhirTumorMarkerBundle } from '@/__mocks__/bundles';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Head from 'next/head';
import React, { ReactElement, useState } from 'react';

type SearchPageProps = {
  patient: Patient;
  user?: User;
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
  publicRuntimeConfig: { disableSearchLocation, defaultSearchZipCode, defaultSearchTravelDistance, fhirQueryFlavor },
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
    age: patient?.age || '',
    gender: patient?.gender || 'unknown',
    cancerType: primaryCancerCondition?.cancerType ?? null,
    cancerSubtype: primaryCancerCondition?.cancerSubtype ?? null,
    stage: primaryCancerCondition?.stage ?? null,
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
        <SearchForm defaultValues={defaultValues} setUserId={setUserId} disableLocation={disableSearchLocation} />
      </UserIdContext.Provider>
    </>
  );
};

export default SearchPage;

export const getServerSideProps: GetServerSideProps<SearchPageProps> = async context => {
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
          age: '35',
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
        metastasis: [],
        biomarkers: [],
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
