// For now, the types are simply loaded statically
import CANCER_CODES from './cancerCodes.json';
import SNOMED_CODES from './snomedCodes.json';
import { NamedSNOMEDCode, SnomedCodeDB } from './snomed';

/**
 * For now, the code lookup DB is just exported. This may not work in the future if the number of codes expands to the
 * point where they can't reasonably be statically included. For now, however...
 */
export const snomedCodeNameDB = new SnomedCodeDB(SNOMED_CODES);

function createCodeList(codes: string[]): NamedSNOMEDCode[] {
  return Array.from(new Set(codes))
    .map(code => {
      return { code: code, display: snomedCodeNameDB.getDisplayString(code) };
    })
    .sort((a, b) => {
      return a.display < b.display ? -1 : a.display > b.display ? 1 : 0;
    });
}

/**
 * Internal cache containing cancer type codes (as this will otherwise be loaded each time)
 */
let cachedCancerTypeCodes: NamedSNOMEDCode[] | null = null;
/**
 * Loads a set of primary cancer codes
 * @returns a Promise that resolve to a set of CancerCodes
 */
export function getCancerTypeCodes(): Promise<NamedSNOMEDCode[]> {
  if (cachedCancerTypeCodes) {
    return Promise.resolve(cachedCancerTypeCodes);
  }
  // If the codes aren't "loaded" then "load" them
  return Promise.resolve((cachedCancerTypeCodes = createCodeList(CANCER_CODES.types)));
}

/**
 * Internal cache containing cancer subtype codes (as this will otherwise be loaded each time)
 */
let cachedCancerSubtypeCodes: NamedSNOMEDCode[] | null = null;

export function getCancerSubtypeCodes(): Promise<NamedSNOMEDCode[]> {
  if (cachedCancerSubtypeCodes) {
    return Promise.resolve(cachedCancerSubtypeCodes);
  }
  // If the codes aren't "loaded" then "load" them
  return Promise.resolve((cachedCancerSubtypeCodes = createCodeList(CANCER_CODES.subtypes)));
}
