import { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';
import BRAIN_BIOMARKER_CODES from 'src/queries/mockData/brainBiomarkerCodes.json';
import BRAIN_CANCER_TYPE_CODES from 'src/queries/mockData/brainCancerTypeCodes.json';
import BRAIN_MEDICATION_CODES from 'src/queries/mockData/brainMedicationCodes.json';
import BREAST_CANCER_BIOMARKERS from 'src/queries/mockData/breastCancerBiomarkerCodes.json';
import BREAST_CANCER_MEDICATIONS from 'src/queries/mockData/breastCancerMedicationCodes.json';
import BREAST_CANCER_STAGES from 'src/queries/mockData/breastCancerStageCodes.json';
//import BreastCancerSurgeryCodes from 'src/queries/mockData/breastCancerSurgeryCodes.json';
import BREAST_CANCER_TYPE_CODES from 'src/queries/mockData/breastCancerTypeCodes.json';
import COLON_CANCER_TYPE_CODES from 'src/queries/mockData/colonCancerTypeCodes.json';
import COLON_MEDICATION_CODES from 'src/queries/mockData/colonMedicationCodes.json';
import COLON_RADIATION_CODES from 'src/queries/mockData/colonRadiationCodes.json';
import COLON_SURGERY_CODES from 'src/queries/mockData/colonSurgeryCodes.json';
import {
  default as BRAIN_CANCER_SUBTYPE_CODES,
  default as BRAIN_RADIATION_CODES,
  default as BRAIN_SURGERY_CODES,
} from 'src/queries/mockData/empty.json';
import LUNG_CANCER_SUBTYPE_CODES from 'src/queries/mockData/lungCancerSubTypeCodes.json';
import LUNG_CANCER_TYPE_CODES from 'src/queries/mockData/lungCancerTypeCodes.json';
import LUNG_MEDICATION_CODES from 'src/queries/mockData/lungMedicationCodes.json';
import LUNG_RADIATION_CODES from 'src/queries/mockData/lungRadiationCodes.json';
import LUNG_SURGERY_CODES from 'src/queries/mockData/lungSurgeryCodes.json';
import MULTIPLE_MYELOMA_CANCERTYPE_CODES from 'src/queries/mockData/MultipleMyelomaCancerTypeCodes.json';
import MULTIPLE_MYELOMA_MEDICATION_CODES from 'src/queries/mockData/MultipleMyelomaMedicationCodes.json';
import PROSTATE_CANCER_TYPE_CODES from 'src/queries/mockData/prostateCancerTypeCodes.json';

export type CancerTypeDetails = {
  category: string;
  cancerCodes: NamedSNOMEDCode[];
  cancerSubtype: NamedSNOMEDCode[];
  biomarkers: NamedSNOMEDCode[];
  surgeryCodes: NamedSNOMEDCode[];
  medications: NamedSNOMEDCode[];
  stages: NamedSNOMEDCode[];
  radiationCodes: NamedSNOMEDCode[];
};
console.log('BREAST_CANCER_STAGES=');
export const cancerTypeDetails: Record<string, CancerTypeDetails> = {
  lung: buildCancerCodeJSON(
    'lung',
    LUNG_CANCER_TYPE_CODES.entry,
    LUNG_CANCER_SUBTYPE_CODES.entry,
    LUNG_MEDICATION_CODES.entry,
    LUNG_RADIATION_CODES.entry,
    LUNG_SURGERY_CODES.entry,
    BREAST_CANCER_STAGES.entry,
    BREAST_CANCER_BIOMARKERS.entry
  ),
  colon: buildCancerCodeJSON(
    'colon',
    COLON_CANCER_TYPE_CODES.entry,
    null,
    COLON_MEDICATION_CODES.entry,
    COLON_RADIATION_CODES.entry,
    COLON_SURGERY_CODES.entry,
    BREAST_CANCER_STAGES.entry,
    null
  ),
  brain: buildCancerCodeJSON(
    'brain',
    BRAIN_CANCER_TYPE_CODES.entry,
    BRAIN_CANCER_SUBTYPE_CODES.entry,
    BRAIN_MEDICATION_CODES.entry,
    BRAIN_RADIATION_CODES.entry,
    BRAIN_SURGERY_CODES.entry,
    BREAST_CANCER_STAGES.entry,
    BRAIN_BIOMARKER_CODES.entry
  ),
  prostate: buildCancerCodeJSON(
    'prostate',
    PROSTATE_CANCER_TYPE_CODES.entry,
    null,
    null,
    null,
    null,
    BREAST_CANCER_STAGES.entry,
    null
  ),
  breast: buildCancerCodeJSON(
    'breast',
    BREAST_CANCER_TYPE_CODES.entry,
    null,
    BREAST_CANCER_MEDICATIONS.entry,
    null,
    null,
    BREAST_CANCER_STAGES.entry,
    BREAST_CANCER_BIOMARKERS.entry
  ),
  mm: buildCancerCodeJSON(
    'mm',
    MULTIPLE_MYELOMA_CANCERTYPE_CODES.entry,
    null,
    MULTIPLE_MYELOMA_MEDICATION_CODES.entry,
    null,
    null,
    BREAST_CANCER_STAGES.entry,
    null
  ),
};

export const cancerTypeOptions: NamedSNOMEDCode[] = Object.values(cancerTypeDetails).reduce<NamedSNOMEDCode[]>(
  (codes: NamedSNOMEDCode[], details) => {
    codes.push(...details.cancerCodes);
    return codes;
  },
  []
);

function buildCancerCodeJSON(
  category: string,
  cancerCodes: NamedSNOMEDCode[],
  subTypeCodes: NamedSNOMEDCode[],
  medicationCodes: NamedSNOMEDCode[],
  radiationCodes: NamedSNOMEDCode[],
  surgeryCodes: NamedSNOMEDCode[],
  stages: NamedSNOMEDCode[],
  biomarkerCodes: NamedSNOMEDCode[]
) {
  const details: CancerTypeDetails = {
    category: category,
    cancerCodes: cancerCodes,
    cancerSubtype: subTypeCodes,
    biomarkers: biomarkerCodes,
    medications: medicationCodes,
    radiationCodes: radiationCodes,
    surgeryCodes: surgeryCodes,
    stages: stages,
  };

  return details;
}
