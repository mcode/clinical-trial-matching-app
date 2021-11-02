// For now, the types are simply loaded statically
import CANCER_CODES from './cancerCodes.json';

export interface CancerCode {
  display: string;
  primary?: string;
  histology?: string;
  fromPatient?: boolean;
}

function codeComplexity(code: CancerCode): number {
  let complexity = 0;
  if (code.primary) complexity++;
  if (code.histology) complexity++;
  return complexity;
}

/**
 * Internal cache containing cancer codes (as this will otherwise be loaded each time)
 */
let cachedCancerCodes: CancerCode[] | null = null;

/**
 * Loads a set of cancer ccodes
 * @returns a Promise that resolve to a set of CancerCodes
 */
export function getCancerCodes(): Promise<CancerCode[]> {
  if (cachedCancerCodes) {
    return Promise.resolve(cachedCancerCodes);
  }
  // If the codes aren't "loaded" then "load" them - for now that just means removing duplicates and sorting the list
  // There are a number of instances where codes are duplicated. For now, pick
  // the "most complicated" type
  const uniqueCodes = new Map<string, CancerCode>();
  for (const code of CANCER_CODES) {
    if (uniqueCodes.has(code.display)) {
      // See if this one is "more complicated"
      if (codeComplexity(code) > codeComplexity(uniqueCodes.get(code.display))) {
        uniqueCodes.set(code.display, code);
      }
    } else {
      uniqueCodes.set(code.display, code);
    }
  }
  cachedCancerCodes = Array.from(uniqueCodes.values());
  // And then sort
  cachedCancerCodes.sort((a, b) => {
    if (a.fromPatient) {
      // codes from the patient always sort "less than" ones without
      if (!b.fromPatient) {
        return -1;
      }
    } else if (b.fromPatient) {
      // Codes not from the patient always sort "greater than" ones with
      return 1;
    }
    // Otherwise, use string comparison
    return a.display < b.display ? -1 : a.display === b.display ? 0 : 1;
  });
  return Promise.resolve(cachedCancerCodes);
}
