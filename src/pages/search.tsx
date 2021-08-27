import React, { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';

import PatientCard from '@/components/PatientCard';
import { Patient, convertFhirPatient } from '@/utils/patient';
import { User, convertFhirUser } from '@/utils/user';

type SearchPageProps = {
  patient: Patient;
  user: User;
};

const SearchPage = ({ patient }: SearchPageProps): ReactElement => {
  return (
    <>
      <Head>
        <title>Search | Clinical Trial Finder</title>
      </Head>

      <PatientCard patient={patient} />
      <pre>{JSON.stringify(patient, null, 2)}</pre>
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

  const [fhirPatient, fhirUser] = await Promise.all([fhirClient.patient.read(), fhirClient.user.read()]);

  return {
    props: { patient: convertFhirPatient(fhirPatient), user: convertFhirUser(fhirUser) },
  };
};
