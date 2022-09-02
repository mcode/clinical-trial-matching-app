import { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';
import brainBiomarkerCodes from 'src/queries/mockData/brainBiomarkerCodes.json';
import brainCancerTypeCodes from 'src/queries/mockData/brainCancerTypeCodes.json';
import brainMedicationCodes from 'src/queries/mockData/brainMedicationCodes.json';
import breastCancerBiomarkers from 'src/queries/mockData/breastCancerBiomarkerCodes.json';
import breastCancerMedications from 'src/queries/mockData/breastCancerMedicationCodes.json';
import breastCancerStages from 'src/queries/mockData/breastCancerStageCodes.json';
//import breastCancerSurgeryCodes from 'src/queries/mockData/breastCancerSurgeryCodes.json';
import breastCancerTypeCodes from 'src/queries/mockData/breastCancerTypeCodes.json';
import colonCancerTypeCodes from 'src/queries/mockData/colonCancerTypeCodes.json';
import colonMedicationCodes from 'src/queries/mockData/colonMedicationCodes.json';
import colonRadiationCodes from 'src/queries/mockData/colonRadiationCodes.json';
import colonSurgeryCodes from 'src/queries/mockData/colonSurgeryCodes.json';
import {
  default as brainCancerSubTypeCodes,
  default as brainRadiationCodes,
  default as brainSurgeryCodes,
} from 'src/queries/mockData/empty.json';
import lungCancerSubTypeCodes from 'src/queries/mockData/lungCancerSubTypeCodes.json';
import lungCancerTypeCodes from 'src/queries/mockData/lungCancerTypeCodes.json';
import lungMedicationCodes from 'src/queries/mockData/lungMedicationCodes.json';
import lungRadiationCodes from 'src/queries/mockData/lungRadiationCodes.json';
import lungSurgeryCodes from 'src/queries/mockData/lungSurgeryCodes.json';
import multipleMyelomaCancerTypeCodes from 'src/queries/mockData/MultipleMyelomaCancerTypeCodes.json';
import multipleMyelomaMedicationCodes from 'src/queries/mockData/MultipleMyelomaMedicationCodes.json';
import prostateCancerTypeCodes from 'src/queries/mockData/prostateCancerTypeCodes.json';

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

export const cancerTypeDetails: Record<string, CancerTypeDetails> = {
  lung: buildCancerCodeJSON(
    'lung',
    lungCancerTypeCodes.entry,
    lungCancerSubTypeCodes.entry,
    lungMedicationCodes.entry,
    lungRadiationCodes.entry,
    lungSurgeryCodes.entry,
    breastCancerStages.entry,
    breastCancerBiomarkers.entry
  ),
  colon: buildCancerCodeJSON(
    'colon',
    colonCancerTypeCodes.entry,
    null,
    colonMedicationCodes.entry,
    colonRadiationCodes.entry,
    colonSurgeryCodes.entry,
    breastCancerStages.entry,
    null
  ),
  brain: buildCancerCodeJSON(
    'brain',
    brainCancerTypeCodes.entry,
    brainCancerSubTypeCodes.entry,
    brainMedicationCodes.entry,
    brainRadiationCodes.entry,
    brainSurgeryCodes.entry,
    breastCancerStages.entry,
    brainBiomarkerCodes.entry
  ),
  prostate: buildCancerCodeJSON(
    'prostate',
    prostateCancerTypeCodes.entry,
    null,
    null,
    null,
    null,
    breastCancerStages.entry,
    null
  ),
  breast: buildCancerCodeJSON(
    'breast',
    breastCancerTypeCodes.entry,
    null,
    breastCancerMedications.entry,
    null,
    null,
    breastCancerStages.entry,
    breastCancerBiomarkers.entry
  ),
  mm: buildCancerCodeJSON(
    'mm',
    multipleMyelomaCancerTypeCodes.entry,
    null,
    multipleMyelomaMedicationCodes.entry,
    null,
    null,
    breastCancerStages.entry,
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
