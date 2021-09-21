import React, { ReactElement } from 'react';
import { QueryClient, useQuery } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';

import PatientCard from '@/components/PatientCard';
import mockSearchResults from '@/__mocks__/results.json';
import { clinicalTrialSearchQuery } from '@/queries';
import { Patient, convertFhirPatient } from '@/utils/patient';
import { User, convertFhirUser } from '@/utils/user';

type ResultsPageProps = {
  patient: Patient;
  user: User;
};

const ResultsPage = ({ patient }: ResultsPageProps): ReactElement => {
  const { data } = useQuery(['clinical-trials'], () => clinicalTrialSearchQuery(), { refetchOnMount: false });

  return (
    <>
      <Head>
        <title>Results | Clinical Trial Finder</title>
      </Head>

      <PatientCard patient={patient} />
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </>
  );
};

export default ResultsPage;

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res } = context;

  const queryClient = new QueryClient();
  let fhirClient: Client;
  try {
    fhirClient = await smart(req, res).ready();
  } catch (e) {
    return { props: {}, redirect: { destination: '/launch', permanent: false } };
  }

  const [fhirPatient, fhirUser] = await Promise.all([fhirClient.patient.read(), fhirClient.user.read()]);
  await queryClient.prefetchQuery(['clinical-trials'], () => mockSearchResults);

  return {
    props: {
      patient: convertFhirPatient(fhirPatient),
      user: convertFhirUser(fhirUser),
      dehydratedState: dehydrate(queryClient),
    },
  };
};
