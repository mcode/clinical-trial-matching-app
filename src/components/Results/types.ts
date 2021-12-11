import { MouseEventHandler } from 'react';

export type ContactProps = { name?: string; phone?: string; email?: string; distance?: string };
export type LikelihoodProps = { text: string; color: string };
export type StatusProps = { text: string; color: string };
export type StudyDetail = { header: string; body: string };

export type StudyProps = {
  closestFacility: ContactProps;
  conditions: string[];
  trialId: string;
  source: string;
  description: string;
  eligibility: string;
  keywords: string[];
  likelihood: LikelihoodProps;
  period: string;
  phase: string;
  sponsor: ContactProps;
  contacts: ContactProps[];
  status: StatusProps;
  title: string;
  type: string;
};

export type SaveStudyHandler = MouseEventHandler<HTMLButtonElement>;

export type BundleEntry = fhir4.BundleEntry & { resource: fhir4.ResearchStudy };

export type SavedStudiesState = Set<string>;

export type SavedStudiesAction = { type: 'toggleSave'; value: BundleEntry } | { type: 'setInitialState' };
