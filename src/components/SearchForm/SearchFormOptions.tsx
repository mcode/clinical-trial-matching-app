import { tmpdir } from 'os';
import { isAssertEntry, isTemplateTail } from 'typescript';
/*import { fetchbrainBiomarkerCodesQuery,
    fetchBrainCancerCodesQuery ,
    fetchBrainMedicationCodesQuery ,
    fetchBreastcancerCodesQuery,
    fetchColonBiomarkerCodesQuery,
    fetchColonCancerTypeCodesQuery,
    fetchColonMedicationCodesQuery,
    fetchColonRadiationCodesQuery ,
    fetchColonStageCodesQuery ,
    fetchColonSurgeryCodesQuery ,
    fetchLungCancerSubTypeCodesQuery,
    fetchLungCancerTypeCodesQuery ,
    fetchLungMedicationCodesQuery ,
    fetchLungRadiationCodesQuery ,
    fetchLungSurgeryCodesQuery ,
    fetchMultipleMyelomaCancerCodesQuery ,
    fetchMultipleMyelomaMedicationCodesQuery ,
    fetchprostateCancerTypeCodesQuery ,
    fetchprostateMedicationCodesQuery 
} from '../../../src/queries/fetchCancerTypeCodesQuery'  ;
*/


//import type { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';
console.log("lungCancerTypeCodes len="+lungCancerTypeCodes.entry.length);
/*for ( var i = 0 ; i < lungCancerTypeCodes.entry.length; i++){
    console.log(lungCancerTypeCodes.entry[i].display)

}*/  
var cancerCodeList=brainCancerTypeCodes;

cancerCodeList=buildAllCancerTypeJSON( cancerCodeList, prostateCancerTypeCodes);
export const allCancerCodes=cancerCodeList; 
 for ( var i = 0 ; i < cancerCodeList.entry.length; i++){
  console.log(allCancerCodes.entry[i].display+"+\r\n")

}

 // export const  breastCancer_cancerTypeJSON = fetchBreastcancerCodesQuery; 
  export const breastCancer_cancerSubTypeOptions=[];
  //export const breastCancer_cancerSubTypeOptions=buildOptionListfromJSON(breastcancerCodes); 
  export const breastCancer_cancerSubType="";

  //export const breastCancer_cancerType="";
   
  export const breastCancer_stage = [0, 1, 2.1, 2.2, 3.1, 3.2, 3.3, 4];
  export const breastCancer_cancerTypeOptions=buildOptionListfromJSON(breastcancerCodes);
  export const breastCancer_medications = "";
  export const breastCancer_procedures = "";
  export const breastCancer_proceduresOptions = "";
  export const breastCancer_biomarkers="";
  export const breastCancer_biomarkersOptions="";
  // Lung Cancer
  //export const lungCancer_cancerType =fetchLungCancerTypeCodesQuery(); 
  export const lungCancerTypeCodesOptions=buildOptionListfromJSON(lungCancerTypeCodes); 
  console.log("brainClungCancerTypeCodesancerTypeCodes="+lungCancerTypeCodes.toString());
  //export const lungCancer_cancerSubType = fetchLungCancerSubTypeCodesQuery(); 
  export const lungCancer_cancerSubTypeOptions=buildOptionListfromJSON(lungCancerSubTypeCodes);
  export const lungCancer_biomarkers = "";
  export const lungCancer_biomarkersOptions=[];
  export const lungCancer_stageOptions = [0, 1, 2, 3.1, 3.2, 3.3, 3.4, 4];
  //export const lungCancer_medications = fetchLungMedicationCodesQuery(); 
  export const lungCancer_medicationsOptions=buildOptionListfromJSON(lungMedicationCodes);
  //export const lungCancer_procedures = fetchLungSurgeryCodesQuery(); 
  export const lungCancer_proceduresOptions=buildOptionListfromJSON(lungSurgeryCodes);
  //export const lungCancer_radiationCodes=fetchLungRadiationCodesQuery(); 
  export const lungCancer_radiationCodeOptions=buildOptionListfromJSON(lungRadiationCodes);
  
  // Colon Cancer
 // export const colonCancer_cancerType = fetchColonCancerTypeCodesQuery(); 
  export const colonCancer_cancerTypeOptions=buildOptionListfromJSON(colonCancerTypeCodes);
  export const colonCancer_cancerSubType = "";
  //export const colonCancer_cancerSubTypeOptions=buildOptionListfromJSON(colonCancer_cancerSubType);
  export const colonCancer_cancerSubTypeOptions=[];
  //export const colonCancer_biomarkers = fetchColonCancerTypeCodesQuery(); 
  export const colonCancer_biomarkersOptions=buildOptionListfromJSON(colonBiomarkerCodes);
  //export const colonCancer_stage = fetchColonStageCodesQuery(); 
  export const colonCancer_stageOptions=buildOptionListfromJSON(colonStageCodes);
  //export const colonCancer_medications = fetchColonMedicationCodesQuery(); 
  export const colonCancer_medicationsOptions=buildOptionListfromJSON(colonMedicationCodes);
  //export const colonCancer_procedures = fetchColonSurgeryCodesQuery(); 
  export const colonCancer_proceduresOptions=buildOptionListfromJSON(colonSurgeryCodes);
  
  // Brain Cancer
  //export const brainCancer_cancerType =fetchColonCancerTypeCodesQuery(); 
  export const brainCancer_cancerTypeOptions=buildOptionListfromJSON(brainCancerTypeCodes);

  export const brainCancer_cancerSubType = ""; 
  export const brainCancer_cancerSubTypeOptions=[];
  //export const brainCancer_biomarkers = fetchbrainBiomarkerCodesQuery(); 
  export const brainCancer_biomarkersOptions=buildOptionListfromJSON(brainBiomarkerCodes);
  //export const brainCancer_medications=fetchBrainMedicationCodesQuery(); 
  export const brainCancer_medicationsOptions=buildOptionListfromJSON(brainMedicationCodes);

  // Prostate Cancer
  //export const prostateCancer_cancerType = fetchprostateCancerTypeCodesQuery(); 
  export const prostateCancer_cancerTypeOptions=buildOptionListfromJSON(prostateCancerTypeCodes);
  export const prostateCancer_biomarkers = ""; 
  export const prostateCancer_biomarkersOptions=[];
  export const prostateCancer_stageOptions = breastCancer_stage;
  //export const lungCancer_radiationCodeOptions=buildOptionListfromJSON(lungCancer_radiationCodes);
  //export const prostateCancer_medications = fetchprostateMedicationCodesQuery(); 
  export const prostateCancer_medicationsOptions=buildOptionListfromJSON(prostateMedicationCodes);
  export const  prostateCancer_procedures = "";
  export const prostateCancer_proceduresOptions=[];

  // MM Cancer
  //export const mmCancer_cancerType = fetchMultipleMyelomaCancerCodesQuery(); 
  export const mmCancer_cancerTypeOptions = buildOptionListfromJSON(MultipleMyelomaCancerTypeCodes);
  
  //export const mmCancer_medications =fetchMultipleMyelomaMedicationCodesQuery(); 
  export const mmCancer_medicationsOptions = buildOptionListfromJSON(MultipleMyelomaMedicationCodes);
  

  function buildOptionListfromJSON( obj){
    var  optionList=[]; 
    for (var i = 0; i < obj.entry.length; i++) {
       
        optionList[i] = obj.entry[i].display;
        
    }
    return optionList;
  }
  function buildAllCancerTypeJSON(cancerTypes,  obj){
    var tmp={ };
    
    for (var i = 0; i < obj.entry.length; i++) {

       console.log("adding "+JSON.stringify(obj.entry[i])+"to All Cancer Types");
        cancerTypes.entry.push(obj.entry[i]);
    }
    return cancerTypes;
  }



