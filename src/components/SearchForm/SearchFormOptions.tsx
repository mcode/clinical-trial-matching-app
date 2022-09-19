import { CodedValueType } from '@/utils/fhirConversionUtils';
import BRAIN_BIOMARKER_CODES from '../../queries/mockData/brainBiomarkerCodes.json';
import BRAIN_CANCER_TYPE_CODES from '../../queries/mockData/brainCancerTypeCodes.json';
import BRAIN_MEDICATION_CODES from '../../queries/mockData/brainMedicationCodes.json';
import BREAST_CANCER_BIOMARKERS from '../../queries/mockData/breastCancerBiomarkerCodes.json';
import BREAST_CANCER_MEDICATIONS from '../../queries/mockData/breastCancerMedicationCodes.json';
import BREAST_CANCER_STAGES from '../../queries/mockData/breastCancerStageCodes.json';
import BREAST_CANCER_TYPE_CODES from '../../queries/mockData/breastCancerTypeCodes.json';
import BREAST_CANCER_SURGERY_CODES from '../../queries/mockData/breastSurgeryCodes.json';
import COLON_CANCER_TYPE_CODES from '../../queries/mockData/colonCancerTypeCodes.json';
import COLON_MEDICATION_CODES from '../../queries/mockData/colonMedicationCodes.json';
import COLON_RADIATION_CODES from '../../queries/mockData/colonRadiationCodes.json';
import COLON_SURGERY_CODES from '../../queries/mockData/colonSurgeryCodes.json';
import {
  default as BRAIN_CANCER_SUBTYPE_CODES,
  default as BRAIN_RADIATION_CODES,
  default as BRAIN_SURGERY_CODES,
} from '../../queries/mockData/empty.json';
import LUNG_CANCER_SUBTYPE_CODES from '../../queries/mockData/lungCancerSubTypeCodes.json';
import LUNG_CANCER_TYPE_CODES from '../../queries/mockData/lungCancerTypeCodes.json';
import LUNG_MEDICATION_CODES from '../../queries/mockData/lungMedicationCodes.json';
import LUNG_SURGERY_CODES from '../../queries/mockData/lungSurgeryCodes.json';
import MULTIPLE_MYELOMA_CANCERTYPE_CODES from '../../queries/mockData/MultipleMyelomaCancerTypeCodes.json';
import MULTIPLE_MYELOMA_MEDICATION_CODES from '../../queries/mockData/MultipleMyelomaMedicationCodes.json';
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
    cancerCodes: LUNG_CANCER_TYPE_CODES.entry,
    cancerSubtype: LUNG_CANCER_SUBTYPE_CODES.entry,
    biomarkers: BREAST_CANCER_BIOMARKERS.entry, //these are the same as the breast cancer Biomarkers
    medications: LUNG_MEDICATION_CODES.entry,
    radiationCodes: LUNG_MEDICATION_CODES.entry,
    surgeryCodes: LUNG_SURGERY_CODES.entry,
    stages: BREAST_CANCER_STAGES.entry,
  },
  colon: {
    category: 'colon',
    cancerCodes: COLON_CANCER_TYPE_CODES.entry,
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: COLON_MEDICATION_CODES.entry, //No biomarker codes provided for colon cancer
    medications: COLON_RADIATION_CODES.entry,
    radiationCodes: COLON_RADIATION_CODES.entry,
    surgeryCodes: COLON_SURGERY_CODES.entry,
    stages: BREAST_CANCER_STAGES.entry,
  },
  brain: {
    category: 'brain',
    cancerCodes: BRAIN_CANCER_TYPE_CODES.entry,
    cancerSubtype: BRAIN_CANCER_SUBTYPE_CODES.entry, // No cancer subtype codes provided for colon cancer
    biomarkers: BRAIN_BIOMARKER_CODES.entry, //No biomarker codes provided for colon cancer
    medications: BRAIN_MEDICATION_CODES.entry,
    radiationCodes: BRAIN_RADIATION_CODES.entry,
    surgeryCodes: BRAIN_SURGERY_CODES.entry,
    stages: BREAST_CANCER_STAGES.entry,
  },
  prostate: {
    category: 'prostate',
    cancerCodes: PROSTATE_CANCER_TYPE_CODES.entry,
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: BREAST_CANCER_STAGES.entry, //No biomarker codes provided for colon cancer
    medications: [], // No Medication Codes provided
    radiationCodes: [], // No radiation codes provided
    surgeryCodes: [], //No Surgery Codes provided
    stages: BREAST_CANCER_STAGES.entry,
  },
  breast: {
    category: 'breast',
    cancerCodes: BREAST_CANCER_TYPE_CODES.entry,
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: BREAST_CANCER_BIOMARKERS.entry,
    medications: BREAST_CANCER_MEDICATIONS.entry,
    radiationCodes: [], // No radiation codes provided
    surgeryCodes: BREAST_CANCER_SURGERY_CODES.entry, //No Surgery Codes provided
    stages: BREAST_CANCER_STAGES.entry,
  },
  mm: {
    category: 'mm',
    cancerCodes: MULTIPLE_MYELOMA_CANCERTYPE_CODES.entry,
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: BREAST_CANCER_BIOMARKERS.entry,
    medications: MULTIPLE_MYELOMA_MEDICATION_CODES.entry,
    radiationCodes: [], // No radiation codes provided
    surgeryCodes: [], //No Surgery Codes provided
    stages: BREAST_CANCER_STAGES.entry,
  },
};
export const cancerTypeOptions: CodedValueType[] = Object.values(cancerTypeDetails).reduce<CodedValueType[]>(
  (codes: CodedValueType[], details) => {
    codes.push(...details.cancerCodes);
    return codes;
  },
  []
);
