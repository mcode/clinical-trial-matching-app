/**
 * This module is used to filter FHIR records.
 */

import {
  BundleEntry,
  Condition,
  Extension,
  FhirResource,
  MedicationStatement,
  Observation,
  Procedure,
  Reference,
} from 'fhir/r4';
import {
  clinicalTest,
  dataAbsentReason,
  laboratory,
  LOINC_CODE_URI,
  MCODE_CANCER_RELATED_MEDICATION_STATEMENT,
  MCODE_CANCER_RELATED_RADIATION_PROCEDURE,
  MCODE_CANCER_RELATED_SURGICAL_PROCEDURE,
  MCODE_CLINICAL_STAGE_GROUP,
  MCODE_ECOG_PERFORMANCE_STATUS,
  MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR,
  MCODE_KARNOFSKY_PERFORMANCE_STATUS,
  MCODE_PRIMARY_CANCER_CONDITION,
  MCODE_SECONDARY_CANCER_CONDITION,
  MCODE_TUMOR_MARKER,
  requiredCategory,
  SNOMED_CODE_URI,
} from './fhirConstants';
import { Biomarker, CodedValueType as CodedValueType, Score } from './fhirConversionUtils';

export const resourceToEntry = (resource: FhirResource): BundleEntry => ({
  resource,
});

const getSubject = (patientId: string): Reference | null =>
  patientId ? { reference: `urn:uuid:${patientId}`, type: 'Patient' } : null;

export const getPrimaryCancerCondition = ({
  cancerType,
  histologyMorphology,
  patientId,
}: {
  cancerType: CodedValueType;
  histologyMorphology?: Extension;
  patientId: string;
}): Condition | null => {
  const { code, display, system } = { ...cancerType };

  if (!!code && !!display && !!system) {
    return {
      resourceType: 'Condition',
      meta: { profile: [MCODE_PRIMARY_CANCER_CONDITION] },
      subject: getSubject(patientId),
      code: { coding: [{ system, code, display }] },
      ...(histologyMorphology ? { extension: [histologyMorphology] } : {}),
      category: [{ coding: [{ system: SNOMED_CODE_URI, code: '64572001' }] }],
    };
  }

  return null;
};

/**
 * Adds a histology morphology extension to an existing bundle.
 * @param cancerSubtype the code to add
 * @returns the existing Condition the extension was added to or the newly created Condition
 */
// Permanent mCODE IG link: http://hl7.org/fhir/us/mcode/STU1/StructureDefinition-mcode-histology-morphology-behavior.html
export const getHistologyMorphologyBehavior = (cancerSubtype: CodedValueType): Extension | null => {
  const { code, display, system } = { ...cancerSubtype };
  if (!!code && !!display && !!system) {
    return {
      url: MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR,
      valueCodeableConcept: { coding: [{ code, display, system }] },
    };
  }
  return null;
};

// Permanent mCODE IG link: http://hl7.org/fhir/us/mcode/STU1/StructureDefinition-mcode-secondary-cancer-condition.html
export const getSecondaryCancerCondition = ({
  cancerType,
  patientId,
}: {
  cancerType: CodedValueType;
  patientId: string;
}): Condition | null => {
  const { code, display, system } = { ...cancerType };

  if (!!code && !!display && !!system) {
    return {
      resourceType: 'Condition',
      meta: { profile: [MCODE_SECONDARY_CANCER_CONDITION] },
      subject: getSubject(patientId),
      code: { coding: [{ system, code, display }] },
      category: [{ coding: [{ system: SNOMED_CODE_URI, code: '64572001' }] }],
    };
  }

  return null;
};

export const getEcogPerformanceStatus = ({
  ecogScore,
  patientId,
}: {
  ecogScore: Score;
  patientId: string;
}): Observation | null => {
  const { interpretation, valueInteger } = { ...ecogScore };
  const { code, display, system } = { ...interpretation };
  if (!!code && !!display && !!system) {
    return {
      resourceType: 'Observation',
      status: 'final',
      subject: getSubject(patientId),
      interpretation: [{ coding: [{ system, code, display }] }],
      meta: { profile: [MCODE_ECOG_PERFORMANCE_STATUS] },
      code: { coding: [{ system: LOINC_CODE_URI, code: '89247-1' }] },
      ...(valueInteger ? { valueInteger } : { dataAbsentReason }),
      category: [clinicalTest, requiredCategory],
    };
  }
  return null;
};

export const getKarnofskyPerformanceStatus = ({
  karnofskyScore,
  patientId,
}: {
  karnofskyScore: Score;
  patientId: string;
}): Observation | null => {
  const { interpretation, valueInteger } = { ...karnofskyScore };
  const { code, display, system } = { ...interpretation };
  if (!!code && !!display && !!system) {
    return {
      resourceType: 'Observation',
      status: 'final',
      subject: getSubject(patientId),
      interpretation: [{ coding: [{ system, code, display }] }],
      meta: { profile: [MCODE_KARNOFSKY_PERFORMANCE_STATUS] },
      code: { coding: [{ system: LOINC_CODE_URI, code: '89243-0' }] },
      ...(valueInteger ? { valueInteger } : { dataAbsentReason }),
      category: [clinicalTest, requiredCategory],
    };
  }
  return null;
};

/*
  Permanent mCODE IG links:
  http://hl7.org/fhir/us/mcode/STU1/StructureDefinition-mcode-tnm-clinical-stage-group.html
  http://hl7.org/fhir/us/mcode/STU1/StructureDefinition-mcode-tnm-pathological-stage-group.html
*/
export const getClinicalStageGroup = ({
  stage,
  patientId,
}: {
  stage: CodedValueType;
  patientId: string;
}): Observation | null => {
  const { code, system, display } = { ...stage };
  if (!!code && !!system && !!display) {
    return {
      resourceType: 'Observation',
      status: 'final',
      subject: getSubject(patientId),
      meta: { profile: [MCODE_CLINICAL_STAGE_GROUP] },
      code: { coding: [{ code: '21908-9', system: SNOMED_CODE_URI }] },
      valueCodeableConcept: { coding: [{ code, system, display }] },
    };
  }
  return null;
};

// Permanent mCODE IG link: http://hl7.org/fhir/us/mcode/STU1/StructureDefinition-mcode-tumor-marker.html
export const getTumorMarker = ({
  biomarker,
  patientId,
}: {
  biomarker: Biomarker;
  patientId: string;
}): Observation | null => {
  const { code, display, system, qualifier } = { ...biomarker };
  if (!!code && !!display && !!system && !!qualifier) {
    return {
      resourceType: 'Observation',
      status: 'final',
      subject: getSubject(patientId),
      ...(!!qualifier.code && !!qualifier.system
        ? {
            valueCodeableConcept: {
              coding: [{ code: qualifier.code, display: qualifier.display, system: qualifier.system }],
            },
          }
        : dataAbsentReason),
      meta: { profile: [MCODE_TUMOR_MARKER] },
      code: { coding: [{ code, display, system }] },
      category: [laboratory],
    };
  }
  return null;
};

// Permanent mCODE IG link: http://hl7.org/fhir/us/mcode/STU1/StructureDefinition-mcode-cancer-related-medication-statement.html
export function getCancerRelatedMedicationStatement({
  medication,
  patientId,
}: {
  medication: CodedValueType;
  patientId: string;
}): MedicationStatement | null {
  const { code, display, system } = { ...medication };
  if (!!code && !!display && !!system) {
    return {
      resourceType: 'MedicationStatement',
      subject: getSubject(patientId),
      status: 'completed',
      medicationCodeableConcept: { coding: [{ system, code, display }] },
      meta: { profile: [MCODE_CANCER_RELATED_MEDICATION_STATEMENT] },
      // MedicationStatement.effective[x] is 1..1 but won't be meaningful since the patient is artificial
      effectiveDateTime: getCurrentTime(),
    };
  }
  return null;
}

// Permanent mCODE IG link: http://hl7.org/fhir/us/mcode/STU1/StructureDefinition-mcode-cancer-related-surgical-procedure.html
export function getCancerRelatedSurgicalProcedure({
  surgery,
  patientId,
}: {
  surgery: CodedValueType;
  patientId: string;
}): Procedure | null {
  const { code, display, system } = { ...surgery };
  if (!!code && !!display && !!system) {
    return {
      resourceType: 'Procedure',
      subject: getSubject(patientId),
      status: 'completed',
      code: { coding: [{ system, code, display }] },
      meta: { profile: [MCODE_CANCER_RELATED_SURGICAL_PROCEDURE] },
      // Procedure.performed[x] is 1..1 but won't be meaningful since the patient is artificial
      performedDateTime: getCurrentTime(),
    };
  }
  return null;
}

// Permanent mCODE IG link: http://hl7.org/fhir/us/mcode/STU1/StructureDefinition-mcode-cancer-related-radiation-procedure.html
export function getCancerRelatedRadiationProcedure({
  radiation,
  patientId,
}: {
  radiation: CodedValueType;
  patientId: string;
}): Procedure | null {
  const { code, display, system } = { ...radiation };
  if (!!code && !!display && !!system) {
    return {
      resourceType: 'Procedure',
      subject: getSubject(patientId),
      status: 'completed',
      code: { coding: [{ system, code, display }] },
      meta: { profile: [MCODE_CANCER_RELATED_RADIATION_PROCEDURE] },
      // Procedure.performed[x] is 1..1 but won't be meaningful since the patient is artificial
      performedDateTime: getCurrentTime(),
    };
  }
  return null;
}

const getCurrentTime = (): string => {
  const now = Date.now();
  const today = new Date(now);
  return today.toISOString();
};
