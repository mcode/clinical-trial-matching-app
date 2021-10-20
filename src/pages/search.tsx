import React, { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';

import Header from '@/components/Header';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { Patient, convertFhirPatient } from '@/utils/patient';
import { User, convertFhirUser } from '@/utils/user';

type SearchPageProps = {
  patient: Patient;
  user: User;
};

const SearchPage = ({ patient, user }: SearchPageProps): ReactElement => {
  const defaultValues = {
    age: patient.age || '',
    cancerType: patient.cancerType || '',
    travelDistance: '100',
    zipcode: patient.zipcode || '',
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

  const urlPatientId = encodeURIComponent(fhirClient.getPatientId());
  const [fhirPatient, fhirUser, fhirCancerConditions] = await Promise.all([
    fhirClient.patient.read(),
    fhirClient.user.read(),
    fhirClient.request<fhirclient.FHIR.Bundle>(
      `Condition?patient=${urlPatientId}&_profile=${encodeURIComponent(
        'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-primary-cancer-condition'
      )}`
    ),
  ]);

  return {
    props: {
      patient: convertFhirPatient(fhirPatient),
      user: convertFhirUser(fhirUser),
      fhirCancerConditions,
    },
  };
};
