import { Biomarker, CodedValueType, Score } from '@/utils/fhirConversionUtils';

export type SearchFormValuesType = {
  userid: string | null;
  matchingServices: { [key: string]: boolean };
  zipcode: string;
  travelDistance: string;
  age: string;
  gender: string;
  cancerType: CodedValueType | null;
  cancerSubtype: CodedValueType | null;
  diseaseStatus: CodedValueType | null;
  metastasis: CodedValueType[];
  stage: CodedValueType;
  primaryTumorStage: CodedValueType | null;
  ecogScore: Score;
  karnofskyScore: Score;
  biomarkers: Biomarker[];
  radiation: CodedValueType[];
  surgery: CodedValueType[];
  medications: CodedValueType[];
};

export type State = Record<
  keyof Pick<
    SearchFormValuesType,
    'cancerSubtype' | 'cancerType' | 'diseaseStatus' | 'medications' | 'metastasis' | 'primaryTumorStage' | 'radiation' | 'stage' | 'surgery'
  >,
  CodedValueType[]
> &
  Record<keyof Pick<SearchFormValuesType, 'ecogScore' | 'karnofskyScore'>, Score[]> &
  Record<keyof Pick<SearchFormValuesType, 'biomarkers'>, Biomarker[]>;
