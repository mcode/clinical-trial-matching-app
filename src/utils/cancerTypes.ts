// For now, the types are simply loaded statically
import CANCER_CODES from './cancerCodes.json';

export interface CancerCode {
  display: string;
  primary?: string;
  histology?: string;
}

function codeComplexity(code: CancerCode): number {
  let complexity = 0;
  if (code.primary) complexity++;
  if (code.histology) complexity++;
  return complexity;
}

export function getCancerCodes(): Promise<CancerCode[]> {
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
  return Promise.resolve(Array.from(uniqueCodes.values()));
}
