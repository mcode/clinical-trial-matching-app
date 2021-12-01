import { ResearchStudy } from 'fhir/r4';
import { MouseEventHandler } from 'react';

export type ContactProps = { name?: string; phone?: string; email?: string; distance?: string };
export type LikelihoodProps = { text: string; color: string };
export type StatusProps = { text: string; color: string };
export type StudyDetail = { header: string; body: string };

export type StudyProps = {
  closestFacility: ContactProps;
  conditions: string[];
  details: StudyDetail[];
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

export type SavedStudiesState = {
  ids: Set<string>;
  savedStudies: ResearchStudy[];
};

export type SavedStudiesAction =
  | { type: 'toggleSave'; value: { study: ResearchStudy; studies: ResearchStudy[] } }
  | { type: 'setInitialState'; value: { studies: ResearchStudy[] } };
