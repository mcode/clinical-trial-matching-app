import {
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
  OBSERVATION_CATEGORY_URI,
  RXNORM_CODE_URI,
  SNOMED_CODE_URI,
  US_CORE_OBSERVATION_CATEGORY_URI,
} from '../fhirConstants';
import { Biomarker, CancerType, CodedValueType, Score } from '../fhirConversionUtils';
import {
  getCancerRelatedMedicationStatement,
  getCancerRelatedRadiationProcedure,
  getCancerRelatedSurgicalProcedure,
  getClinicalStageGroup,
  getEcogPerformanceStatus,
  getHistologyMorphologyBehavior,
  getKarnofskyPerformanceStatus,
  getPrimaryCancerCondition,
  getSecondaryCancerCondition,
  getTumorMarker,
  resourceToEntry,
} from '../fhirFilter';

const cancerType: CodedValueType = {
  entryType: 'cancerType',
  cancerType: [CancerType.LUNG],
  code: '422968005',
  display: 'Non-small cell carcinoma of lung, TNM stage 3 (disorder)',
  system: SNOMED_CODE_URI,
  category: ['nsclc'],
};

const cancerSubtype: CodedValueType = {
  entryType: 'cancerSubtype',
  cancerType: [CancerType.LUNG],
  code: '1082251000119103',
  display: 'Primary squamous cell carcinoma of middle lobe of right lung (disorder)',
  system: SNOMED_CODE_URI,
  category: ['scc'],
};

const ecogScore: Score = {
  interpretation: {
    code: 'LA9626-8',
    display: 'Completely disabled. Cannot carry on any selfcare. Totally confined to bed or chair',
    system: LOINC_CODE_URI,
  },
  valueInteger: 4,
  entryType: 'ecogScore',
};

const karnofskyScore: Score = {
  interpretation: {
    display: 'Cares for self; unable to carry on normal activity or do active work',
    code: 'LA29178-3',
    system: LOINC_CODE_URI,
  },
  valueInteger: 70,
  entryType: 'karnofskyScore',
};

const stage: CodedValueType = {
  code: '261643006',
  category: ['4'],
  display: 'Stage 4B',
  system: SNOMED_CODE_URI,
  cancerType: [CancerType.BREAST, CancerType.PROSTATE],
  entryType: 'stage',
};

const biomarker: Biomarker = {
  entryType: 'biomarkers',
  cancerType: [CancerType.COLON],
  code: '42783-1',
  display: 'ERBB2 gene mutations found [Identifier] in Blood or Tissue by Molecular genetics method Nominal',
  system: LOINC_CODE_URI,
  category: ['erbb2_her2'],
  qualifier: {
    code: '260385009',
    display: 'Negative (qualifier value)',
    system: SNOMED_CODE_URI,
  },
};

const medication: CodedValueType = {
  entryType: 'medications',
  cancerType: [CancerType.BREAST],
  code: '1301015',
  display: 'drospirenone 0.25 MG',
  system: RXNORM_CODE_URI,
  category: ['progestin'],
};

const surgery: CodedValueType = {
  entryType: 'surgery',
  cancerType: [CancerType.COLON],
  code: '24221008',
  display: 'Repair of rectovesical fistula with colostomy',
  system: SNOMED_CODE_URI,
  category: ['colostomy'],
};

const radiation: CodedValueType = {
  entryType: 'radiation',
  cancerType: [CancerType.BREAST, CancerType.COLON, CancerType.LUNG],
  code: '228690002',
  display: 'Iodine 125 brachytherapy (procedure)',
  system: SNOMED_CODE_URI,
  category: ['Ablation', 'Brachytherapy'],
};

const patientId = 'patient-123';

const partiallyEmptyCodedValueType: Omit<CodedValueType, 'entryType'> = {
  code: '',
  system: SNOMED_CODE_URI,
  display: '',
  cancerType: [CancerType.PROSTATE],
  category: ['EXAMPLE_CATEGORY'],
};

const partiallyEmptyScore: Omit<Score, 'entryType'> = {
  interpretation: {
    code: '',
    display: '',
    system: '',
  },
  valueInteger: -1,
};

describe('resourceToEntry', () => {
  it('produces a BundleEntry from a Resource', () => {
    expect(resourceToEntry({ resourceType: 'Observation', status: 'final', code: {} })).toEqual({
      resource: { resourceType: 'Observation', status: 'final', code: {} },
    });
  });
});

describe('getPrimaryCancerCondition', () => {
  it('produces an mCODE Primary Cancer Condition when supplied with a cancer type and patient id', () => {
    expect(getPrimaryCancerCondition({ cancerType, patientId })).toEqual({
      category: [{ coding: [{ code: '64572001', system: SNOMED_CODE_URI }] }],
      code: {
        coding: [
          {
            code: '422968005',
            display: 'Non-small cell carcinoma of lung, TNM stage 3 (disorder)',
            system: SNOMED_CODE_URI,
          },
        ],
      },
      meta: { profile: [MCODE_PRIMARY_CANCER_CONDITION] },
      resourceType: 'Condition',
      subject: { reference: 'urn:uuid:patient-123', type: 'Patient' },
    });
  });

  it('returns null when the cancer type information cannot be evaluated', () => {
    expect(
      getPrimaryCancerCondition({
        cancerType: { ...partiallyEmptyCodedValueType, entryType: 'cancerType' },
        patientId,
      })
    ).toBe(null);
  });
});

describe('getHistologyMorphologyBehavior', () => {
  it('produces an mCODE Histology Morphology Extension', () => {
    expect(getHistologyMorphologyBehavior(cancerSubtype)).toEqual({
      url: MCODE_HISTOLOGY_MORPHOLOGY_BEHAVIOR,
      valueCodeableConcept: {
        coding: [
          {
            code: '1082251000119103',
            display: 'Primary squamous cell carcinoma of middle lobe of right lung (disorder)',
            system: SNOMED_CODE_URI,
          },
        ],
      },
    });
  });

  it('returns null when the cancer subtype information cannot be evaluated', () => {
    expect(getHistologyMorphologyBehavior({ ...partiallyEmptyCodedValueType, entryType: 'cancerSubtype' })).toBe(null);
  });
});

describe('getSecondaryCancerCondition', () => {
  it('produces an mCODE Secondary Cancer Condition when supplied with a cancer type and patient id', () => {
    expect(getSecondaryCancerCondition({ cancerType, patientId })).toEqual({
      category: [{ coding: [{ code: '64572001', system: SNOMED_CODE_URI }] }],
      code: {
        coding: [
          {
            code: '422968005',
            display: 'Non-small cell carcinoma of lung, TNM stage 3 (disorder)',
            system: SNOMED_CODE_URI,
          },
        ],
      },
      meta: { profile: [MCODE_SECONDARY_CANCER_CONDITION] },
      resourceType: 'Condition',
      subject: { reference: 'urn:uuid:patient-123', type: 'Patient' },
    });
  });

  it('returns null when the cancer type information cannot be evaluated', () => {
    expect(
      getSecondaryCancerCondition({
        cancerType: { ...partiallyEmptyCodedValueType, entryType: 'cancerType' },
        patientId,
      })
    ).toBe(null);
  });
});

describe('getEcogPerformanceStatus', () => {
  it('produces an mCODE ECOG Performance Status Observation when supplied with a ECOG score and patient id', () => {
    expect(getEcogPerformanceStatus({ ecogScore, patientId })).toEqual({
      category: [
        {
          coding: [{ code: 'clinical-test', system: US_CORE_OBSERVATION_CATEGORY_URI }],
        },
        { coding: [{ code: 'survey', system: OBSERVATION_CATEGORY_URI }] },
      ],
      code: { coding: [{ code: '89247-1', system: LOINC_CODE_URI }] },
      interpretation: [
        {
          coding: [
            {
              code: 'LA9626-8',
              display: 'Completely disabled. Cannot carry on any selfcare. Totally confined to bed or chair',
              system: LOINC_CODE_URI,
            },
          ],
        },
      ],
      meta: { profile: [MCODE_ECOG_PERFORMANCE_STATUS] },
      resourceType: 'Observation',
      status: 'final',
      subject: { reference: 'urn:uuid:patient-123', type: 'Patient' },
      valueInteger: 4,
    });
  });

  it('returns null when the ECOG score information cannot be evaluated', () => {
    expect(
      getEcogPerformanceStatus({
        ecogScore: { ...partiallyEmptyScore, entryType: 'ecogScore' },
        patientId,
      })
    ).toBe(null);
  });
});

describe('getKarnofskyPerformanceStatus', () => {
  it('produces an mCODE Karnofsky Performance Status Observation when supplied with a Karnofsky score and patient id', () => {
    expect(getKarnofskyPerformanceStatus({ karnofskyScore, patientId })).toEqual({
      category: [
        {
          coding: [{ code: 'clinical-test', system: US_CORE_OBSERVATION_CATEGORY_URI }],
        },
        { coding: [{ code: 'survey', system: OBSERVATION_CATEGORY_URI }] },
      ],
      code: { coding: [{ code: '89243-0', system: LOINC_CODE_URI }] },
      interpretation: [
        {
          coding: [
            {
              code: 'LA29178-3',
              display: 'Cares for self; unable to carry on normal activity or do active work',
              system: LOINC_CODE_URI,
            },
          ],
        },
      ],
      meta: { profile: [MCODE_KARNOFSKY_PERFORMANCE_STATUS] },
      resourceType: 'Observation',
      status: 'final',
      subject: { reference: 'urn:uuid:patient-123', type: 'Patient' },
      valueInteger: 70,
    });
  });

  it('returns null when the ECOG score information cannot be evaluated', () => {
    expect(
      getKarnofskyPerformanceStatus({
        karnofskyScore: { ...partiallyEmptyScore, entryType: 'karnofskyScore' },
        patientId,
      })
    ).toBe(null);
  });
});

describe('getClinicalStageGroup', () => {
  expect(getClinicalStageGroup({ stage, patientId })).toEqual({
    code: { coding: [{ code: '21908-9', system: SNOMED_CODE_URI }] },
    meta: { profile: [MCODE_CLINICAL_STAGE_GROUP] },
    resourceType: 'Observation',
    status: 'final',
    subject: { reference: 'urn:uuid:patient-123', type: 'Patient' },
    valueCodeableConcept: { coding: [{ code: '261643006', display: 'Stage 4B', system: SNOMED_CODE_URI }] },
  });

  it('returns null when the stage information cannot be evaluated', () => {
    expect(
      getClinicalStageGroup({
        stage: { ...partiallyEmptyCodedValueType, entryType: 'stage' },
        patientId,
      })
    ).toBe(null);
  });
});

describe('getTumorMarker', () => {
  expect(getTumorMarker({ biomarker, patientId })).toEqual({
    category: [{ coding: [{ code: 'laboratory', system: OBSERVATION_CATEGORY_URI }] }],
    code: {
      coding: [
        {
          code: '42783-1',
          display: 'ERBB2 gene mutations found [Identifier] in Blood or Tissue by Molecular genetics method Nominal',
          system: LOINC_CODE_URI,
        },
      ],
    },
    meta: { profile: [MCODE_TUMOR_MARKER] },
    resourceType: 'Observation',
    status: 'final',
    subject: { reference: 'urn:uuid:patient-123', type: 'Patient' },
    valueCodeableConcept: {
      coding: [{ code: '260385009', display: 'Negative (qualifier value)', system: SNOMED_CODE_URI }],
    },
  });

  it('returns null when the biomarker information cannot be evaluated', () => {
    expect(
      getTumorMarker({
        biomarker: { ...partiallyEmptyCodedValueType, entryType: 'stage', qualifier: {} },
        patientId,
      })
    ).toBe(null);
  });
});

describe('getCancerRelatedMedicationStatement', () => {
  jest.spyOn(Date, 'now').mockImplementationOnce(() => Date.UTC(1987, 11, 3));

  expect(getCancerRelatedMedicationStatement({ medication, patientId })).toEqual({
    effectiveDateTime: '1987-12-03T00:00:00.000Z',
    medicationCodeableConcept: {
      coding: [{ code: '1301015', display: 'drospirenone 0.25 MG', system: RXNORM_CODE_URI }],
    },
    meta: { profile: [MCODE_CANCER_RELATED_MEDICATION_STATEMENT] },
    resourceType: 'MedicationStatement',
    status: 'completed',
    subject: { reference: 'urn:uuid:patient-123', type: 'Patient' },
  });

  it('returns null when the medication information cannot be evaluated', () => {
    expect(
      getCancerRelatedMedicationStatement({
        medication: { ...partiallyEmptyCodedValueType, entryType: 'medications' },
        patientId,
      })
    ).toBe(null);
  });
});

describe('getCancerRelatedSurgicalProcedure', () => {
  jest.spyOn(Date, 'now').mockImplementationOnce(() => Date.UTC(1987, 11, 3));

  expect(getCancerRelatedSurgicalProcedure({ surgery, patientId })).toEqual({
    code: {
      coding: [
        {
          code: '24221008',
          display: 'Repair of rectovesical fistula with colostomy',
          system: SNOMED_CODE_URI,
        },
      ],
    },
    meta: { profile: [MCODE_CANCER_RELATED_SURGICAL_PROCEDURE] },
    performedDateTime: '1987-12-03T00:00:00.000Z',
    resourceType: 'Procedure',
    status: 'completed',
    subject: { reference: 'urn:uuid:patient-123', type: 'Patient' },
  });

  it('returns null when the surgery information cannot be evaluated', () => {
    expect(
      getCancerRelatedSurgicalProcedure({
        surgery: { ...partiallyEmptyCodedValueType, entryType: 'surgery' },
        patientId,
      })
    ).toBe(null);
  });
});

describe('getCancerRelatedRadiationProcedure', () => {
  jest.spyOn(Date, 'now').mockImplementationOnce(() => Date.UTC(1987, 11, 3));

  expect(getCancerRelatedRadiationProcedure({ radiation, patientId })).toEqual({
    code: {
      coding: [{ code: '228690002', display: 'Iodine 125 brachytherapy (procedure)', system: SNOMED_CODE_URI }],
    },
    meta: { profile: [MCODE_CANCER_RELATED_RADIATION_PROCEDURE] },
    performedDateTime: '1987-12-03T00:00:00.000Z',
    resourceType: 'Procedure',
    status: 'completed',
    subject: { reference: 'urn:uuid:patient-123', type: 'Patient' },
  });

  it('returns null when the radiation information cannot be evaluated', () => {
    expect(
      getCancerRelatedRadiationProcedure({
        radiation: { ...partiallyEmptyCodedValueType, entryType: 'radiation' },
        patientId,
      })
    ).toBe(null);
  });
});
