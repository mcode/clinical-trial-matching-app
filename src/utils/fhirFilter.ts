/**
 * This module is used to filter FHIR records.
 */

import { Bundle, BundleEntry, CodeableConcept, Condition, Resource, Observation } from 'types/fhir-types';
import { NamedSNOMEDCode } from './fhirConversionUtils';
import { MCODE_PRIMARY_CANCER_CONDITION, MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR, SNOMED_CODE_URI } from './fhirConstants';

export const addResource = (bundle: Bundle, resource: Resource): void => {
  const entry: BundleEntry = {
    resource: resource,
  };
  if (bundle.entry) {
    bundle.entry.push(entry);
  } else {
    bundle.entry = [entry];
  }
};

export const addCancerType = (bundle: Bundle, code: NamedSNOMEDCode): Condition => {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking
  const resource: Condition = {
    resourceType: 'Condition',
    meta: {
      profile: [MCODE_PRIMARY_CANCER_CONDITION],
    },
    code: {
      coding: [
        {
          system: SNOMED_CODE_URI,
          code: code.code,
          display: code.display,
        },
      ],
    },
  };
  addResource(bundle, resource);
  return resource;
};

function findCondition(bundleOrCondition: Bundle | Condition, profile: string): Condition | null {
  if (bundleOrCondition.resourceType === 'Condition') {
    return bundleOrCondition as Condition;
  }
  const entries = (bundleOrCondition as Bundle).entry;
  if (entries) {
    const conditionEntry = entries.find((entry): boolean => {
      if (entry.resource.resourceType === 'Condition') {
        // Check to see if it matches the profile
        if (entry.resource.meta?.profile?.indexOf(profile) >= 0) {
          return true;
        }
      }
      return false;
    });
    if (conditionEntry) {
      return conditionEntry.resource as Condition;
    }
  }
  return null;
}

/**
 * Adds a histology morphology extension to an existing bundle.
 * @param bundleOrCondition the bundle containing a primary cancer condition or the condition itself
 * @param code the code to add
 * @returns the existing Condition the extension was added to or the newly created Condition
 */
export const addCancerHistologyMorphology = (
  bundleOrCondition: Bundle | Condition,
  code: NamedSNOMEDCode
): Condition => {
  // Find the actual condition
  let condition = findCondition(bundleOrCondition, MCODE_PRIMARY_CANCER_CONDITION);
  // If we didn't find a condition, we need to create one
  if (!condition) {
    condition = {
      resourceType: 'Condition',
    };
  }
  const histology = {
    url: MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR,
    valueCodeableConcept: {
      code: code.code,
      display: code.display,
    },
  };
  if (condition.extension) {
    condition.extension.push(histology);
  } else {
    condition.extension = [histology];
  }
  return condition;
};

<<<<<<< HEAD
export function convertStringtoResource ({ bundle, valueString, id, profile_value, codingSystem, codingSystemCode }: { bundle; valueString: string; id; profile_value; codingSystem; codingSystemCode; }): void
{
    // Create the Condition - done separate from the function call to ensure proper TypeScript checking
    let code:any=null;
    let resource : Observation;

    if ( codingSystemCode) {
      code={
        coding: [
          {
            system: codingSystem,
            code: codingSystemCode, 
          },
        ],
      }  
    } 
    if (code){ 
        let resource : Observation= {
          resourceType: "Observation",
          id: id,
          meta: {
            profile: profile_value,
          },
        code,
        valueString,
        };
        addResource(bundle, resource);
      } else {
         
          let resource : Observation= {
            resourceType: "Observation",
            id: id,
            meta: {
              profile: profile_value,
            },
            valueString,
          };
          addResource(bundle, resource);
      }
        
    
    

     
      
  
    
   
  };
=======
export function convertStringtoResource({
  bundle,
  valueString,
  id,
  profile_value,
  codingSystem,
  codingSystemCode,
}: {
  bundle: Bundle;
  valueString: string;
  id: string;
  profile_value: string;
  codingSystem: string;
  codingSystemCode: string;
}): void {
  // Create the Condition - done separate from the function call to ensure proper TypeScript checking
  let code: CodeableConcept = null;
  let resource: Observation;
  if (codingSystemCode) {
    code = {
      coding: [
        {
          system: codingSystem,
          code: codingSystemCode,
        },
      ],
    };
  }
  if (code) {
    const resource: Observation = {
      resourceType: 'Observation',
      id: id,
      meta: {
        profile: [profile_value],
      },
      code,
      valueString,
    };
    addResource(bundle, resource);
  } else {
    const resource: Observation = {
      resourceType: 'Observation',
      id: id,
      meta: {
        profile: [profile_value],
      },
      valueString,
    };
    addResource(bundle, resource);
  }

  console.log(`**** resource for  =${id} is...\r\n ` + JSON.stringify(resource));
  console.log('*************************************');
}
>>>>>>> 24bde663229bb03be5fa015eaf3a2ad22dc9d66b
