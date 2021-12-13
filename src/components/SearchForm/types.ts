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
  cancerType: NamedSNOMEDCode;
  cancerSubtype: NamedSNOMEDCode;
  metastasis: string[];
  stage: string;
  ecogScore: string;
  karnofskyScore: string;
  biomarkers: string[];
  radiation: string[];
  surgery: string[];
  medications: string[];
};
