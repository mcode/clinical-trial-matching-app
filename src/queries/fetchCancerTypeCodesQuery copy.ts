//import mockCancerCodes from './mockData/cancerCodes.json';
import brainBiomarkerCodes from './mockData/brainBiomarkerCodes.json';
import brainCancerTypeCodes from './mockData/brainCancerTypeCodes.json';
import brainMedicationCodes from './mockData/brainMedicationCodes.json';
import breastcancerCodes from './mockData/breastcancerCodes.json';
import colonBiomarkerCodes from './mockData/colonBiomarkerCodes.json';
import colonCancerTypeCodes from './mockData/colonCancerTypeCodes.json';
import colonMedicationCodes from './mockData/colonMedicationCodes.json';
import colonRadiationCodes from './mockData/colonRadiationCodes.json';
import colonStageCodes from './mockData/colonStageCodes.json';
import colonSurgeryCodes from './mockData/colonSurgeryCodes.json';
import lungCancerSubTypeCodes from './mockData/lungCancerSubTypeCodes.json';
import lungCancerTypeCodes from './mockData/lungCancerTypeCodes.json';
import lungMedicationCodes from './mockData/lungMedicationCodes.json';
import lungRadiationCodes from './mockData/lungRadiationCodes.json';
import lungSurgeryCodes from './mockData/lungSurgeryCodes.json';
import MultipleMyelomaCancerTypeCodes from './mockData/MultipleMyelomaCancerTypeCodes.json';
import MultipleMyelomaMedicationCodes from './mockData/MultipleMyelomaMedicationCodes.json';
import prostateCancerTypeCodes from './mockData/prostateCancerTypeCodes.json';
import prostateMedicationCodes from './mockData/prostateMedicationCodes.json';

import type { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';

//const fetchCancerCodesQuery = async (): Promise<NamedSNOMEDCode[]> => breastcancerCodes.types;

//console.log("*****BreastCancerCodes="+JSON.stringify(brainCancerTypeCodes));

export const fetchbrainBiomarkerCodesQuery = async (): Promise<NamedSNOMEDCode[]> => brainBiomarkerCodes.entry;
export const fetchBrainCancerCodesQuery = async (): Promise<NamedSNOMEDCode[]> => brainCancerTypeCodes.entry;
export const fetchBrainMedicationCodesQuery = async (): Promise<NamedSNOMEDCode[]> => brainMedicationCodes.medications;
export const fetchBreastcancerCodesQuery = async (): Promise<NamedSNOMEDCode[]> => breastcancerCodes.entry;
export const fetchColonBiomarkerCodesQuery = async (): Promise<NamedSNOMEDCode[]> => colonBiomarkerCodes.entry;
export const fetchColonCancerTypeCodesQuery = async (): Promise<NamedSNOMEDCode[]> => colonCancerTypeCodes.entry;
export const fetchColonMedicationCodesQuery = async (): Promise<NamedSNOMEDCode[]> => colonMedicationCodes.entry;
export const fetchColonRadiationCodesQuery = async (): Promise<NamedSNOMEDCode[]> => colonRadiationCodes.entry;
export const fetchColonStageCodesQuery = async (): Promise<NamedSNOMEDCode[]> => colonStageCodes.entry;
export const fetchColonSurgeryCodesQuery = async (): Promise<NamedSNOMEDCode[]> => colonSurgeryCodes.entry;
export const fetchLungCancerSubTypeCodesQuery = async (): Promise<NamedSNOMEDCode[]> => lungCancerSubTypeCodes.entry;
//export const fetchLungCancerBiomarkers = async (): Promise<NamedSNOMEDCode[]> => lungCancerTypeCodes.entry;
export const fetchLungCancerTypeCodesQuery = async (): Promise<NamedSNOMEDCode[]> => lungCancerTypeCodes.entry;
export const fetchLungMedicationCodesQuery = async (): Promise<NamedSNOMEDCode[]> => lungMedicationCodes.entry;
export const fetchLungRadiationCodesQuery = async (): Promise<NamedSNOMEDCode[]> => lungRadiationCodes.entry;
export const fetchLungSurgeryCodesQuery = async (): Promise<NamedSNOMEDCode[]> => lungSurgeryCodes.entry;
export const fetchMultipleMyelomaCancerCodesQuery = async (): Promise<NamedSNOMEDCode[]> => MultipleMyelomaCancerTypeCodes.entry;
export const fetchMultipleMyelomaMedicationCodesQuery = async (): Promise<NamedSNOMEDCode[]> => MultipleMyelomaMedicationCodes.entry;
export const fetchprostateCancerTypeCodesQuery = async (): Promise<NamedSNOMEDCode[]> => prostateCancerTypeCodes.entry;
export const fetchprostateMedicationCodesQuery = async (): Promise<NamedSNOMEDCode[]> => prostateMedicationCodes.entry;


