// organize-imports-ignore
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import Header from '@/components/Header';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { UserIdContext } from '@/components/UserIdContext';
import { convertEcogScore, convertKarnofskyScore } from '@/utils/epicEHRConverters';
import {
  Biomarker,
  CodedValueType,
  convertFhirPatient,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  extractMedicationCodes,
  extractPrimaryCancerCondition,
  Patient,
  PrimaryCancerCondition,
  Score,
} from '@/utils/fhirConversionUtils';
import { Medication, MedicationRequest, Observation } from 'fhir/r4';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useState } from 'react';

type SearchPageProps = {
  patient: Patient;
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
    cancerType: primaryCancerCondition ? primaryCancerCondition.cancerType : null,
    cancerSubtype: primaryCancerCondition ? primaryCancerCondition.cancerSubtype : null,
    stage: primaryCancerCondition ? primaryCancerCondition.stage : null,
    travelDistance: '100',
    zipcode: patient?.zipcode || '',
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

      <Header />
      <PatientCard patient={patient} />
      <UserIdContext.Provider value={userId}>
        <SearchForm defaultValues={defaultValues} setUserId={setUserId} />
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

  const fhirPatient = await fhirClient.patient.read();

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

const getAllProcedures = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`Procedure?patient=${fhirClient.getPatientId()}`);
};

const getAllConditions = (fhirClient: Client) => {
  return fhirClient.request<fhirclient.FHIR.Bundle>(`Condition?patient=${fhirClient.getPatientId()}`);
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

// This assumes that all of the encounters are in order by date.
const getMostRecentPerformanceValue = async (fhirClient: Client, encounters: fhirclient.FHIR.Bundle, code: string) => {
  for (let i = 0; i < encounters.entry.length; i++) {
    const encounter = encounters.entry[i];
    const observations = await fhirClient.request<fhirclient.FHIR.Bundle>(
      `Observation?patient=${fhirClient.getPatientId()}&category=smartdata&focus=${encounter.resource.id}`
    );
    if (Array.isArray(observations.entry)) {
      console.log(`Encounter SDES ${encounter.resource.id} ${observations.entry.length}`);
      const found = observations.entry.find(
        entry => entry.resource.resourceType === 'Observation' && entry.resource.code?.coding.some(c => c.code === code)
      );
      if (found) {
        return found.resource;
      }
    }
  }
  return undefined;
};
