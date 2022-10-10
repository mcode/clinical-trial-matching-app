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
    cancerCodes: sortByProperty(LUNG_CANCER_TYPE_CODES.entry, 'display', 1),
    cancerSubtype: sortByProperty(LUNG_CANCER_SUBTYPE_CODES.entry, 'display', 1),
    biomarkers: sortByProperty(BREAST_CANCER_BIOMARKERS.entry, 'display', 1), //these are the same as the breast cancer Biomarkers
    medications: sortByProperty(LUNG_MEDICATION_CODES.entry, 'display', 1),
    radiationCodes: sortByProperty(LUNG_MEDICATION_CODES.entry, 'display', 1),
    surgeryCodes: sortByProperty(LUNG_SURGERY_CODES.entry, 'display', 1),
    stages: sortByProperty(BREAST_CANCER_STAGES.entry, 'display', 1),
  },
  colon: {
    category: 'colon',
    cancerCodes: sortByProperty(COLON_CANCER_TYPE_CODES.entry, 'display', 1),
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: sortByProperty(COLON_MEDICATION_CODES.entry, 'display', 1), //No biomarker codes provided for colon cancer
    medications: sortByProperty(COLON_RADIATION_CODES.entry, 'display', 1),
    radiationCodes: sortByProperty(COLON_RADIATION_CODES.entry, 'display', 1),
    surgeryCodes: sortByProperty(COLON_SURGERY_CODES.entry, 'display', 1),
    stages: sortByProperty(BREAST_CANCER_STAGES.entry, 'display', 1),
  },
  brain: {
    category: 'brain',
    cancerCodes: sortByProperty(BRAIN_CANCER_TYPE_CODES.entry, 'display', 1),
    cancerSubtype: sortByProperty(BRAIN_CANCER_SUBTYPE_CODES.entry, 'display', 1), // No cancer subtype codes provided for colon cancer
    biomarkers: sortByProperty(BRAIN_BIOMARKER_CODES.entry, 'display', 1), //No biomarker codes provided for colon cancer
    medications: sortByProperty(BRAIN_MEDICATION_CODES.entry, 'display', 1),
    radiationCodes: sortByProperty(BRAIN_RADIATION_CODES.entry, 'display', 1),
    surgeryCodes: sortByProperty(BRAIN_SURGERY_CODES.entry, 'display', 1),
    stages: sortByProperty(BREAST_CANCER_STAGES.entry, 'display', 1),
  },
  prostate: {
    category: 'prostate',
    cancerCodes: sortByProperty(PROSTATE_CANCER_TYPE_CODES.entry, 'display', 1),
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: sortByProperty(BREAST_CANCER_STAGES.entry, 'display', 1), //No biomarker codes provided for colon cancer
    medications: [], // No Medication Codes provided
    radiationCodes: [], // No radiation codes provided
    surgeryCodes: [], //No Surgery Codes provided
    stages: sortByProperty(BREAST_CANCER_STAGES.entry, 'display', 1),
  },
  breast: {
    category: 'breast',
    cancerCodes: sortByProperty(BREAST_CANCER_TYPE_CODES.entry, 'display', 1),
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: sortByProperty(BREAST_CANCER_BIOMARKERS.entry, 'display', 1),
    medications: sortByProperty(BREAST_CANCER_MEDICATIONS.entry, 'display', 1),
    radiationCodes: [], // No radiation codes provided
    surgeryCodes: sortByProperty(BREAST_CANCER_SURGERY_CODES.entry, 'display', 1), //No Surgery Codes provided
    stages: sortByProperty(BREAST_CANCER_STAGES.entry, 'display', 1),
  },
  mm: {
    category: 'mm',
    cancerCodes: sortByProperty(MULTIPLE_MYELOMA_CANCERTYPE_CODES.entry, 'display', 1),
    cancerSubtype: [], // No cancer subtype codes provided for colon cancer
    biomarkers: sortByProperty(BREAST_CANCER_BIOMARKERS.entry, 'display', 1),
    medications: sortByProperty(MULTIPLE_MYELOMA_MEDICATION_CODES.entry, 'display', 1),
    radiationCodes: [], // No radiation codes provided
    surgeryCodes: [], //No Surgery Codes provided
    stages: sortByProperty(BREAST_CANCER_STAGES.entry, 'display', 1),
  },
};
export const cancerTypeOptions: CodedValueType[] = Object.values(cancerTypeDetails).reduce<CodedValueType[]>(
  (codes: CodedValueType[], details) => {
    codes.push(...details.cancerCodes);
    return codes;
  },
  []
);
export function sortByProperty(objArray, prop, direction, ...args): CodedValueType[] {
  if (arguments.length < 2) throw new Error('ARRAY, AND OBJECT PROPERTY MINIMUM ARGUMENTS, OPTIONAL DIRECTION');
  if (!Array.isArray(objArray)) throw new Error('FIRST ARGUMENT NOT AN ARRAY');
  const clone = objArray.slice(0);
  const direct = args.length > 2 ? args[2] : 1; //Default to ascending
  const propPath = prop.constructor === Array ? prop : prop.split('.');
  clone.sort(function (a, b) {
    for (const p in propPath) {
      if (a[propPath[p]] && b[propPath[p]]) {
        a = a[propPath[p]];
        b = b[propPath[p]];
      }
    }
    // convert numeric strings to integers
    a = a.match(/^\d+$/) ? +a : a;
    b = b.match(/^\d+$/) ? +b : b;
    return a < b ? -1 * direct : a > b ? 1 * direct : 0;
  });
  return clone;
}
