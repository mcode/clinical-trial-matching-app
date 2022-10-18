import { CodedValueType } from '@/utils/fhirConversionUtils';
import BRAIN_BIOMARKER_CODES from '../../queries/mockData/brainBiomarkerCodes.json';
import BRAIN_CANCER_TYPE_CODES from '../../queries/mockData/brainCancerTypeCodes.json';
import BRAIN_MEDICATION_CODES from '../../queries/mockData/brainMedicationCodes.json';
import BREAST_CANCER_BIOMARKERS from '../../queries/mockData/breastCancerBiomarkerCodes.json';
import BREAST_CANCER_MEDICATIONS from '../../queries/mockData/breastCancerMedicationCodes.json';
import BREAST_CANCER_STAGES from '../../queries/mockData/breastCancerStageCodes.json';
import BREAST_CANCER_TYPE_CODES from '../../queries/mockData/breastCancerTypeCodes.json';
import BREAST_CANCER_SURGERY_CODES from '../../queries/mockData/breastSurgeryCodes.json';
import COLON_RADIATION_CODES from '../../queries/mockData/colonBiomarkerCodes.json';
import COLON_CANCER_TYPE_CODES from '../../queries/mockData/colonCancerTypeCodes.json';
import COLON_MEDICATION_CODES from '../../queries/mockData/colonMedicationCodes.json';
import {
  default as COLON_BIOMARKER_CODES,
  default as COLON_SURGERY_CODES,
} from '../../queries/mockData/colonSurgeryCodes.json';
import {
  default as BRAIN_CANCER_SUBTYPE_CODES,
  default as BRAIN_RADIATION_CODES,
  default as BRAIN_SURGERY_CODES,
} from '../../queries/mockData/empty.json';
import LUNG_CANCER_SUBTYPE_CODES from '../../queries/mockData/lungCancerSubTypeCodes.json';
import LUNG_CANCER_TYPE_CODES from '../../queries/mockData/lungCancerTypeCodes.json';
import LUNG_MEDICATION_CODES from '../../queries/mockData/lungMedicationCodes.json';
import LUNG_SURGERY_CODES from '../../queries/mockData/lungSurgeryCodes.json';
import MULTIPLE_MYELOMA_CANCERTYPE_CODES from '../../queries/mockData/mmCancerTypeCodes.json';
import MULTIPLE_MYELOMA_MEDICATION_CODES from '../../queries/mockData/mmMedicationCodes.json';
import PROSTATE_CANCER_TYPE_CODES from '../../queries/mockData/prostateCancerTypeCodes.json';

export type CancerTypeDetailType = {
  category: string;
  cancerCodes: CodedValueType[];
  cancerSubtype: CodedValueType[];
  biomarkers: CodedValueType[];
  surgeryCodes: CodedValueType[];
  medications: CodedValueType[];
  stages: CodedValueType[];
  radiationCodes: CodedValueType[];
};

export const cancerTypeDetails: Record<string, CancerTypeDetailType> = {
  lung: {
    category: 'lung',
    cancerCodes: LUNG_CANCER_TYPE_CODES.entry.sort(compareByProperty('display')),
    cancerSubtype: LUNG_CANCER_SUBTYPE_CODES.entry.sort(compareByProperty('display')),
    biomarkers: BREAST_CANCER_BIOMARKERS.entry.sort(compareByProperty('display')), //these are the same as the breast cancer Biomarkers
    medications: LUNG_MEDICATION_CODES.entry.sort(compareByProperty('display')),
    radiationCodes: LUNG_MEDICATION_CODES.entry.sort(compareByProperty('display')),
    surgeryCodes: LUNG_SURGERY_CODES.entry.sort(compareByProperty('display')),
    stages: BREAST_CANCER_STAGES.entry.sort(compareByProperty('display')),
  },
  colon: {
    category: 'colon',
    cancerCodes: COLON_CANCER_TYPE_CODES.entry.sort(compareByProperty('display')),
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: COLON_BIOMARKER_CODES.entry.sort(compareByProperty('display')), //No biomarker codes provided for colon cancer
    medications: COLON_MEDICATION_CODES.entry.sort(compareByProperty('display')),
    radiationCodes: COLON_RADIATION_CODES.entry.sort(compareByProperty('display')),
    surgeryCodes: COLON_SURGERY_CODES.entry.sort(compareByProperty('display')),
    stages: BREAST_CANCER_STAGES.entry.sort(compareByProperty('display')),
  },
  brain: {
    category: 'brain',
    cancerCodes: BRAIN_CANCER_TYPE_CODES.entry.sort(compareByProperty('display')),
    cancerSubtype: BRAIN_CANCER_SUBTYPE_CODES.entry.sort(compareByProperty('display')), // No cancer subtype codes provided for colon cancer
    biomarkers: BRAIN_BIOMARKER_CODES.entry.sort(compareByProperty('display')), //No biomarker codes provided for colon cancer
    medications: BRAIN_MEDICATION_CODES.entry.sort(compareByProperty('display')),
    radiationCodes: BRAIN_RADIATION_CODES.entry.sort(compareByProperty('display')),
    surgeryCodes: BRAIN_SURGERY_CODES.entry.sort(compareByProperty('display')),
    stages: BREAST_CANCER_STAGES.entry.sort(compareByProperty('display')),
  },
  prostate: {
    category: 'prostate',
    cancerCodes: PROSTATE_CANCER_TYPE_CODES.entry.sort(compareByProperty('display')),
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: BREAST_CANCER_BIOMARKERS.entry.sort(compareByProperty('display')), //No biomarker codes provided for colon cancer
    medications: [], // No Medication Codes provided
    radiationCodes: [], // No radiation codes provided
    surgeryCodes: [], //No Surgery Codes provided
    stages: BREAST_CANCER_STAGES.entry.sort(compareByProperty('display')),
  },
  breast: {
    category: 'breast',
    cancerCodes: BREAST_CANCER_TYPE_CODES.entry.sort(compareByProperty('display')),
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: BREAST_CANCER_BIOMARKERS.entry.sort(compareByProperty('display')),
    medications: BREAST_CANCER_MEDICATIONS.entry.sort(compareByProperty('display')),
    radiationCodes: [], // No radiation codes provided
    surgeryCodes: BREAST_CANCER_SURGERY_CODES.entry.sort(compareByProperty('display')), //No Surgery Codes provided
    stages: BREAST_CANCER_STAGES.entry.sort(compareByProperty('display')),
  },
  mm: {
    category: 'mm',
    cancerCodes: MULTIPLE_MYELOMA_CANCERTYPE_CODES.entry.sort(compareByProperty('display')),
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: BREAST_CANCER_BIOMARKERS.entry.sort(compareByProperty('display')),
    medications: MULTIPLE_MYELOMA_MEDICATION_CODES.entry.sort(compareByProperty('display')),
    radiationCodes: [], // No radiation codes provided
    surgeryCodes: [], //No Surgery Codes provided
    stages: BREAST_CANCER_STAGES.entry.sort(compareByProperty('display')),
  },
};
export const cancerTypeOptions: CodedValueType[] = Object.values(cancerTypeDetails).reduce<CodedValueType[]>(
  (codes: CodedValueType[], details) => {
    codes.push(...details.cancerCodes);
    return codes;
  },
  []
);

export function compareByProperty(prop: string) {
  return function (a: CodedValueType, b: CodedValueType): number {
    if (a[prop] > b[prop]) {
      return 1;
    } else if (a[prop] < b[prop]) {
      return -1;
    }
    return 0;
  };
}
