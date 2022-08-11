import { tmpdir } from 'os';
import { isAssertEntry, isTemplateTail } from 'typescript';
import { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';
import brainBiomarkerCodes from 'src/queries/mockData/brainBiomarkerCodes.json';
import brainCancerTypeCodes from 'src/queries/mockData/brainCancerTypeCodes.json';
import brainMedicationCodes from 'src/queries/mockData/brainMedicationCodes.json';
import breastcancerCodes from 'src/queries/mockData/breastcancerCodes.json';
import brainSurgeryCodes from 'src/queries/mockData/empty.json';
import brainCancerSubTypeCodes from 'src/queries/mockData/empty.json';
import brainRadiationCodes from 'src/queries/mockData/empty.json';

import colonBiomarkerCodes from 'src/queries/mockData/colonBiomarkerCodes.json';
import colonCancerTypeCodes from 'src/queries/mockData/colonCancerTypeCodes.json';
import colonMedicationCodes from 'src/queries/mockData/colonMedicationCodes.json';
import colonRadiationCodes from 'src/queries/mockData/colonRadiationCodes.json';
import colonStageCodes from 'src/queries/mockData/colonStageCodes.json';
import colonSurgeryCodes from 'src/queries/mockData/colonSurgeryCodes.json';

import lungCancerSubTypeCodes from 'src/queries/mockData/lungCancerSubTypeCodes.json';
import lungCancerTypeCodes from 'src/queries/mockData/lungCancerTypeCodes.json';
import lungMedicationCodes from 'src/queries/mockData/lungMedicationCodes.json';
import lungRadiationCodes from 'src/queries/mockData/lungRadiationCodes.json';
import lungSurgeryCodes from 'src/queries/mockData/lungSurgeryCodes.json';

import MultipleMyelomaCancerTypeCodes from 'src/queries/mockData/MultipleMyelomaCancerTypeCodes.json';
import MultipleMyelomaMedicationCodes from 'src/queries/mockData/MultipleMyelomaMedicationCodes.json';

import prostateCancerTypeCodes from 'src/queries/mockData/prostateCancerTypeCodes.json';
import prostateMedicationCodes from 'src/queries/mockData/prostateMedicationCodes.json';

//import type { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';

/*for ( var i = 0 ; i < lungCancerTypeCodes.entry.length; i++){
    console.log(lungCancerTypeCodes.entry[i].display)

}*/
export const breastCancerStages = [0, 1, 2.1, 2.2, 3.1, 3.2, 3.3, 4];
//export const breastCancer_cancerTypeOptions=buildOptionListfromJSON(breastcancerCodes);
export const breastCancerMedications = "";
export const breastCancerSurgeryCodes = "";
export const breastCancer_proceduresOptions = "";
export const breastCancerBiomarkers="";
export const breastCancer_biomarkersOptions="";
export const breastCancerRadiationCodes="";
export const breastCancerSubTypes="";
export const breastCancerCodes='';
export type cancerTypeDetails= {
    category:       string,
    cancerCodes:    NamedSNOMEDCode[],
    cancerSubtype:  NamedSNOMEDCode[],
    biomarkers:     NamedSNOMEDCode[],
    surgeryCodes:   NamedSNOMEDCode[],
    medications:    NamedSNOMEDCode[],
    stages:         NamedSNOMEDCode[],
    radiationCodes: NamedSNOMEDCode[]


  };
  export type cancerTypeObj = {
    lung:       cancerTypeDetails;
    breast:     cancerTypeDetails,
    prostate:   cancerTypeDetails,
    brain:      cancerTypeDetails,
    colon:      cancerTypeDetails,
    mm:      cancerTypeDetails,
  };


let tmp: cancerTypeObj ={
lung: buildCancerCodeJSON("lung", lungCancerTypeCodes,lungCancerSubTypeCodes,lungMedicationCodes,lungRadiationCodes,lungSurgeryCodes,breastCancerStages,breastCancerBiomarkers),
colon:buildCancerCodeJSON("colon", colonCancerTypeCodes,""  ,colonMedicationCodes,colonRadiationCodes,colonSurgeryCodes,breastCancerStages,""),
brain: buildCancerCodeJSON("brain", brainCancerTypeCodes,brainCancerSubTypeCodes,brainMedicationCodes,brainRadiationCodes ,brainSurgeryCodes,breastCancerStages,brainBiomarkerCodes),
prostate:buildCancerCodeJSON("prostate", prostateCancerTypeCodes,"","","","",breastCancerStages,""),
breast:buildCancerCodeJSON("breast", breastCancerCodes,breastCancerSubTypes,breastCancerMedications,breastCancerRadiationCodes,breastCancerSurgeryCodes,breastCancerStages,breastCancerBiomarkers),
mm:buildCancerCodeJSON("mm", MultipleMyelomaCancerTypeCodes,"",MultipleMyelomaMedicationCodes,"","",breastCancerStages,"")


}




export const cancerTypeDetails:cancerTypeObj =tmp;

var ctArray=[];
ctArray.push(tmp)
/*
ctArray.push(cancerTypeDetails.prostate.cancerCodes);
ctArray.push(cancerTypeDetails.colon.cancerCodes);
ctArray.push(cancerTypeDetails.brain.cancerCodes);
ctArray.push(cancerTypeDetails.lung.cancerCodes);*/
export const cancerTypeOptions=ctArray;



function buildCancerCodeJSON(category,cancerCodes,subTypeCodes,medicationCodes,radiationCodes,surgeryCodes,stages,biomarkerCodes){
    var details:cancerTypeDetails={
    category :        category,
    cancerCodes :     cancerCodes,
    cancerSubtype :   subTypeCodes,
    biomarkers :      biomarkerCodes,
    medications :     medicationCodes,
    radiationCodes :  radiationCodes,
    surgeryCodes :    surgeryCodes,
    stages :          stages
    }

    return details;

}
