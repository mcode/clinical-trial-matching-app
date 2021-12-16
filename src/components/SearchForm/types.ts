import { NamedSNOMEDCode } from '@/utils/snomed';

export type SearchFormValuesType = {
  matchingServices: {
    breastCancerTrials: boolean;
    trialjectory: boolean;
    trialscope: boolean;
  };
  zipcode: string;
  travelDistance: string;
  age: string;
  cancerType: NamedSNOMEDCode | null;
  cancerSubtype: NamedSNOMEDCode | null;
  metastasis: string[];
  stage: string;
  ecogScore: string;
  karnofskyScore: string;
  biomarkers: string[];
  radiation: string[];
  surgery: string[];
  medications: string[];
};
