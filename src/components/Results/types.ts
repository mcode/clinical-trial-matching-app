export type ContactProps = { name: string; phone?: string; email?: string; distance?: string };
export type LikelihoodProps = { text: string; color: string };
export type StatusProps = { text: string; color: string };
export type StudyDetail = { header: string; body: string };

export type StudyProps = {
  closestFacility: ContactProps;
  conditions: string[];
  details: StudyDetail[];
  distance: string;
  keywords: string[];
  likelihood: LikelihoodProps;
  period: string;
  phase: string;
  sponsor: ContactProps;
  status: StatusProps;
  title: string;
  type: string;
};
