/**
 * Various FHIR URLs as constants.
 */

/**
 * Root URL for the MCode structure definition URLs.
 */
export const MCODE_STRUCTURE_DEFINITION = 'http://hl7.org/fhir/us/mcode/StructureDefinition/';

/**
 * Primary cancer condition URL.
 */
export const MCODE_PRIMARY_CANCER_CONDITION = MCODE_STRUCTURE_DEFINITION + 'mcode-primary-cancer-condition';

/**
 * The MCode resource URL for histology morphology.
 */
export const MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR = MCODE_STRUCTURE_DEFINITION + 'mcode-histology-morphology-behavior';

/**
 * The system URL for SNOMED codes.
 */
export const SNOMED_CODE_URI = 'http://snomed.info/sct';

/**
 * The MCode ecog performance status url.
 */
export const MCODE_ECOG_PERFORMANCE_STATUS = MCODE_STRUCTURE_DEFINITION + 'mcode-ecog-performance-status';

/**
 * The MCode Karnosfsky Performance status url.
 */
export const MCODE_KARNOFSKY_PERFORMANCE_STATUS = MCODE_STRUCTURE_DEFINITION + 'mcode-karnofsky-performance-status';

/**
 * The MCode Cancer Stage Group url.
 */
export const MCODE_CANCER_STAGE_GROUP = MCODE_STRUCTURE_DEFINITION + 'mcode-cancer-stage-group';
export const MCODE_CLINICAL_DISTANT_METASTASIS =
  MCODE_STRUCTURE_DEFINITION + 'tnm-clinical-distant-metastases-category-cM0';
export const MCODE_CANCER_RELATED_SURGICAL_PROCEDURE =
  MCODE_STRUCTURE_DEFINITION + 'mcode-cancer-related-surgical-procedure';
export const MCODE_CANCER_RELATED_MEDICATION_STATEMENT =
  MCODE_STRUCTURE_DEFINITION + 'mcode-cancer-related-medication-statement';
export const MCODE_CANCER_RELATED_RADIATION_PROCEDURE =
  MCODE_STRUCTURE_DEFINITION + 'mcode-cancer-related-radiation-procedure';
export const MCODE_TUMOR_MARKER = MCODE_STRUCTURE_DEFINITION + 'mcode-tumor-marker';
