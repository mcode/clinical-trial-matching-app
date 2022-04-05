import { Location, ResearchStudy } from 'fhir/r4';
import { MouseEventHandler } from 'react';

export type ContactProps = {
  name?: string;
  phone?: string;
  email?: string;
  distance?: { quantity: number; units: string };
};
export type LikelihoodProps = { text: string; color: string; score: number };
export type StatusProps = {
  name: ResearchStudy['status'] | 'unknown-recruitment-status';
  label: string;
  color: string;
};
export type StudyDetail = { header: string; body: string };

export type Intervention = {
  type?: string;
  title?: string;
  subtitle?: string;
  description?: string;
};

export type ArmGroup = {
  display?: string;
  description?: string;
  interventions?: Intervention[];
};

export type StudyDetailProps = {
  trialId: string;
  conditions?: string[];
  source?: string;
  description?: string;
  eligibility?: string;
  keywords?: string[];
  likelihood?: LikelihoodProps;
  period?: string;
  phase?: string;
  sponsor?: ContactProps;
  contacts?: ContactProps[];
  status?: StatusProps;
  title?: string;
  type?: string;
  arms?: ArmGroup[];
  closestFacilities?: ContactProps[];
  locations?: Location[];
};

export type SaveStudyHandler = MouseEventHandler<HTMLButtonElement>;

export type BundleEntry = fhir4.BundleEntry & { resource: fhir4.ResearchStudy };

export type SavedStudiesState = Set<string>;

export type SavedStudiesAction = { type: 'toggleSave'; value: StudyDetailProps } | { type: 'setInitialState' };
