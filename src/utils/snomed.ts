/**
 * This module provides types and classes related to reading SNOMED codes.
 */

import { CodeableConcept } from './fhirTypes';

/**
 * Mostly for documentation purposes, a SNOMED code is actually a number within the SNOMED system but is represented as
 * a string for the most part.
 */
export type SNOMEDCode = string | number;

/**
 * A SNOMED code combined with a display string.
 */
export interface NamedSNOMEDCode {
  code: SNOMEDCode;
  display: string;
}

export const SNOMED_CODE_URI = 'http://snomed.info/sct';

/**
 * Given a JSON object that contains SNOMED codes to their display names, this
 * provides a method to generate CodeableConcepts from those codes.
 */
export class SnomedCodeDB {
  constructor(private codes: Record<string, string>) {}

  getDisplay(code: SNOMEDCode): string | undefined;
  getDisplay<T>(code: SNOMEDCode, defaultValue: T): string | T;
  getDisplay<T>(code: string | number, defaultValue?: T): string | T {
    if (typeof code !== 'string') {
      code = code.toString();
    }
    return this.codes[code] || defaultValue;
  }

  getDisplayString(code: SNOMEDCode): string {
    const display = this.getDisplay(code);
    return display ?? `SNOMED code ${code}`;
  }

  /**
   * Looks up a SNOMED code within a CodeableConcept.
   * @param concept the CodeableConcept that may contain a SNOMED code
   * @returns the first SNOMED code found or undefined if none was found
   */
  getSnomedCode(concept: CodeableConcept): NamedSNOMEDCode | undefined {
    if (Array.isArray(concept.coding)) {
      for (const code of concept.coding) {
        if (code.system === SNOMED_CODE_URI && typeof code.code === 'string') {
          return {
            code: code.code,
            display: typeof code.display === 'string' ? code.display : this.getDisplayString(code.code),
          };
        }
      }
    }
    // If there is no SNOMED code here, give up
    return undefined;
  }

  getCodeableConcept(code: string | number): CodeableConcept | undefined {
    if (typeof code !== 'string') {
      code = code.toString();
    }
    const display = this.getDisplay(code);
    if (display) {
      return {
        coding: [
          {
            system: SNOMED_CODE_URI,
            code: code,
            display: display,
          },
        ],
        text: display,
      };
    } else {
      return undefined;
    }
  }
}
