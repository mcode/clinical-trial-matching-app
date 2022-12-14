/**
 * Various FHIR URLs as constants.
 */

/**
 * Root URL for the MCode structure definition URLs.
 * The Moonshot server uses STU1 of the MCode IG.
 */
export const MCODE_STRUCTURE_DEFINITION = 'http://hl7.org/fhir/us/mcode/StructureDefinition/';

/**
 * Primary Cancer Condition URL.
 */
export const MCODE_PRIMARY_CANCER_CONDITION = MCODE_STRUCTURE_DEFINITION + 'mcode-primary-cancer-condition';

/**
 * Secondary Cancer Condition URL.
 */
export const MCODE_SECONDARY_CANCER_CONDITION = MCODE_STRUCTURE_DEFINITION + 'mcode-secondary-cancer-condition';

/**
 * Histology Morphology Behavior Extension URL.
 */
export const MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR = MCODE_STRUCTURE_DEFINITION + 'mcode-histology-morphology-behavior';

/**
 * The system URLs for SNOMED, LOINC, and RxNorm codes.
 */
export const SNOMED_CODE_URI = 'http://snomed.info/sct';
export const LOINC_CODE_URI = 'http://loinc.org';
export const RXNORM_CODE_URI = 'http://www.nlm.nih.gov/research/umls/rxnorm';
export const ICD_10_CODE_URI = 'http://hl7.org/fhir/sid/icd-10-cm';

/**
 * ECOG Performance Status URL.
 */
export const MCODE_ECOG_PERFORMANCE_STATUS = MCODE_STRUCTURE_DEFINITION + 'mcode-ecog-performance-status';

/**
 * Karnosfsky Performance Status URL.
 */
export const MCODE_KARNOFSKY_PERFORMANCE_STATUS = MCODE_STRUCTURE_DEFINITION + 'mcode-karnofsky-performance-status';

/**
 * TNM Clinical Stage Group URL.
 */
export const MCODE_CLINICAL_STAGE_GROUP = MCODE_STRUCTURE_DEFINITION + 'mcode-tnm-clinical-stage-group';

/**
 * TNM Distant Metastases Category URL.
 */
export const MCODE_CLINICAL_DISTANT_METASTASIS =
  MCODE_STRUCTURE_DEFINITION + 'tnm-clinical-distant-metastases-category-cM0';

/**
 * Cancer-Related Surgical Procedure URL.
 */
export const MCODE_CANCER_RELATED_SURGICAL_PROCEDURE =
  MCODE_STRUCTURE_DEFINITION + 'mcode-cancer-related-surgical-procedure';

/**
 * Cancer-Related Medication Statement URL.
 * Note: this URL does not resolve.
 * Should the trailing string be 'mcode-cancer-related-medication-request' in the future?
 */
export const MCODE_CANCER_RELATED_MEDICATION_STATEMENT =
  MCODE_STRUCTURE_DEFINITION + 'mcode-cancer-related-medication-statement';

/**
 * Cancer-Related Radiation Procedure URL.
 * Note: this URL does not resolve.
 * Should the trailing string be 'mcode-radiotherapy-course-summary' in the future?
 */
export const MCODE_CANCER_RELATED_RADIATION_PROCEDURE =
  MCODE_STRUCTURE_DEFINITION + 'mcode-cancer-related-radiation-procedure';

/**
 * Tumor Marker URL.
 * Note: this URL does not resolve.
 * Should the trailing string be 'mcode-tumor-marker-test' in the future?
 */
export const MCODE_TUMOR_MARKER = MCODE_STRUCTURE_DEFINITION + 'mcode-tumor-marker';

/**
 * Cancer Patient URL.
 * Note: this URL does not resolve.
 * Should the trailing string be 'mcode-tumor-marker-test' in the future?
 */
export const MCODE_CANCER_PATIENT = MCODE_STRUCTURE_DEFINITION + 'mcode-cancer-patient';

/**
 * US Core Observation Category URL.
 */
export const US_CORE_OBSERVATION_CATEGORY_URI = 'http://hl7.org/fhir/us/core/CodeSystem/us-core-observation-category';

/**
 * Observation Category URL.
 */
export const OBSERVATION_CATEGORY_URI = 'http://terminology.hl7.org/CodeSystem/observation-category';

// Constant CodeableConcept resources used in the different profiles.
export const clinicalTest = {
  coding: [{ system: US_CORE_OBSERVATION_CATEGORY_URI, code: 'clinical-test' }],
};

export const requiredCategory = {
  coding: [{ system: OBSERVATION_CATEGORY_URI, code: 'survey' }],
};

export const dataAbsentReason = {
  coding: [
    {
      system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
      code: 'unknown',
      display: 'Unknown',
    },
  ],
};

export const usCore = {
  coding: [
    {
      system: 'http://terminology.hl7.org/CodeSystem/condition-category',
      code: 'problem-list-item',
    },
  ],
};

export const sdoh = {
  coding: [
    {
      system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-tags',
      code: 'sdoh',
    },
  ],
};

export const laboratory = {
  coding: [
    {
      system: 'http://terminology.hl7.org/CodeSystem/observation-category',
      code: 'laboratory',
    },
  ],
};
