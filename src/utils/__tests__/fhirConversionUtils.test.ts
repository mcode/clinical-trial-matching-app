import {
  fhirEcogPerformanceStatusBundle,
  fhirEmptyBundle,
  fhirKarnofskyPerformanceStatusBundle,
  fhirMedications,
  fhirPatient,
  fhirPrimaryCancerConditionBundle,
  fhirPrimaryCancerConditionBundle2,
  fhirRadiationProcedureBundle,
  fhirSecondaryCancerConditionBundle,
  fhirSurgeryProcedureBundle,
  fhirTumorMarkerBundle,
} from '@/__mocks__/bundles';
import mockPatient from '@/__mocks__/patient';
import { LOINC_CODE_URI, RXNORM_CODE_URI, SNOMED_CODE_URI } from '../fhirConstants';
import {
  CancerType,
  convertFhirEcogPerformanceStatus,
  convertFhirKarnofskyPerformanceStatus,
  convertFhirPatient,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  convertFhirTumorMarkers,
  extractMedicationCodes,
  extractPrimaryCancerCondition,
  isEqualCodedValueType,
} from '../fhirConversionUtils';

describe('convertFhirKarnofskyPerformanceStatus', () => {
  it('gets the Karnofsky score from a bundle', () => {
    expect(convertFhirKarnofskyPerformanceStatus(fhirKarnofskyPerformanceStatusBundle)).toEqual({
      entryType: 'karnofskyScore',
      interpretation: {
        code: 'LA29175-9',
        display: 'Normal; no complaints; no evidence of disease',
        system: LOINC_CODE_URI,
      },
      valueInteger: 100,
    });
    expect(convertFhirKarnofskyPerformanceStatus(fhirEmptyBundle)).toBeNull();
  });
});

describe('convertFhirEcogPerformanceStatus', () => {
  it('gets the ECOG score from a FHIR bundle', () => {
    expect(convertFhirEcogPerformanceStatus(fhirEcogPerformanceStatusBundle)).toEqual({
      entryType: 'ecogScore',
      interpretation: {
        code: 'LA9623-5',
        display:
          'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work',
        system: LOINC_CODE_URI,
      },
      valueInteger: 1,
    });
    expect(convertFhirEcogPerformanceStatus(fhirEmptyBundle)).toBeNull();
  });
});

describe('extractMedicationCodes', () => {
  it('gets the medication codes from a set of medications', () => {
    expect(extractMedicationCodes(fhirMedications)).toEqual([
      {
        cancerType: [CancerType.PROSTATE],
        category: ['Leuprolide'],
        code: '1163443',
        display: 'Leuprolide Injectable Product',
        entryType: 'medications',
        system: RXNORM_CODE_URI,
      },
      {
        cancerType: [CancerType.BREAST],
        category: ['Fulvestrant'],
        code: '1156671',
        display: 'Fulvestrant Injectable Product',
        entryType: 'medications',
        system: RXNORM_CODE_URI,
      },
      {
        cancerType: [CancerType.BREAST],
        category: ['Abemaciclib'],
        code: '1946828',
        display: 'Abemaciclib Pill',
        entryType: 'medications',
        system: RXNORM_CODE_URI,
      },
      {
        cancerType: [CancerType.BREAST],
        category: ['Ribociclib'],
        code: '1873980',
        display: 'Ribociclib Oral Product',
        entryType: 'medications',
        system: RXNORM_CODE_URI,
      },
    ]);
    expect(extractMedicationCodes([])).toEqual([]);
  });
});

describe('convertFhirPatient', () => {
  it('gets the patient from a FHIR Patient', () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => Date.UTC(1987, 11, 3));
    expect(convertFhirPatient(fhirPatient)).toEqual(mockPatient);
  });
});

describe('convertFhirPrimaryCancerCondition', () => {
  it('gets the primary cancer condition from a FHIR Bundle', () => {
    expect(extractPrimaryCancerCondition(fhirPrimaryCancerConditionBundle)).toEqual({
      cancerType: {
        category: ['Breast', 'Invasive Breast', 'Invasive Carcinoma', 'Invasive Ductal Carcinoma'],
        cancerType: [CancerType.BREAST],
        code: '408643008',
        system: SNOMED_CODE_URI,
        display: 'Infiltrating duct carcinoma of breast (disorder)',
        entryType: 'cancerType',
      },
      cancerSubtype: {
        entryType: 'cancerSubtype',
        cancerType: [CancerType.BREAST],
        code: '128700001',
        display: 'Infiltrating duct mixed with other types of carcinoma (morphologic abnormality)',
        system: SNOMED_CODE_URI,
        category: ['Invasive', 'Invasive Carcinoma', 'Invasive Carcinoma Mixed', 'Invasive Ductal Carcinoma'],
      },
      stage: null,
    });
    expect(extractPrimaryCancerCondition(fhirPrimaryCancerConditionBundle2)).toEqual({
      cancerType: {
        entryType: 'cancerType',
        cancerType: [CancerType.BREAST],
        code: '254837009',
        display: 'Malignant neoplasm of breast (disorder)',
        system: SNOMED_CODE_URI,
        category: ['Breast'],
      },
      cancerSubtype: null,
      stage: {
        code: '261614003',
        category: ['2'],
        display: 'Stage 2A',
        system: SNOMED_CODE_URI,
        cancerType: [CancerType.BREAST, CancerType.PROSTATE],
        entryType: 'stage',
      },
    });
    expect(extractPrimaryCancerCondition(fhirEmptyBundle)).toBeNull();
  });
});

describe('convertFhirRadiationProcedures', () => {
  it('gets the radiation procedures from a FHIR Bundle', () => {
    expect(convertFhirRadiationProcedures(fhirRadiationProcedureBundle)).toEqual([
      {
        entryType: 'radiation',
        cancerType: [CancerType.BREAST, CancerType.COLON, CancerType.LUNG],
        code: '879916008',
        display: 'Radiofrequency ablation (procedure)',
        system: SNOMED_CODE_URI,
        category: ['Ablation', 'RFA'],
      },
      {
        entryType: 'radiation',
        cancerType: [CancerType.BREAST, CancerType.LUNG],
        code: '399315003',
        display: 'Radionuclide therapy (procedure)',
        system: SNOMED_CODE_URI,
        category: ['EBRT'],
      },
    ]);
    expect(convertFhirRadiationProcedures(fhirEmptyBundle)).toEqual([]);
  });
});

describe('convertFhirSecondaryCancerConditions', () => {
  it('gets the secondary cancer conditions from a FHIR Bundle', () => {
    expect(convertFhirSecondaryCancerConditions(fhirSecondaryCancerConditionBundle)).toEqual([
      {
        entryType: 'metastasis',
        cancerType: [
          CancerType.BRAIN,
          CancerType.BREAST,
          CancerType.COLON,
          CancerType.LUNG,
          CancerType.MULTIPLE_MYELOMA,
          CancerType.PROSTATE,
        ],
        code: '94222008',
        display: 'Secondary malignant neoplasm of bone',
        system: SNOMED_CODE_URI,
        category: ['Bone'],
      },
    ]);
    expect(convertFhirSecondaryCancerConditions(fhirEmptyBundle)).toEqual([]);
  });
});

describe('convertFhirSurgeryProcedures', () => {
  it('gets the surgery procedures from a FHIR Bundle', () => {
    expect(convertFhirSurgeryProcedures(fhirSurgeryProcedureBundle)).toEqual([
      {
        entryType: 'surgery',
        cancerType: [CancerType.BREAST],
        code: '64368001',
        display: 'Partial mastectomy (procedure)',
        system: SNOMED_CODE_URI,
        category: ['Mastectomy'],
      },
      {
        entryType: 'surgery',
        cancerType: [CancerType.BREAST],
        code: '234262008',
        display: 'Excision of axillary lymph node (procedure)',
        system: SNOMED_CODE_URI,
        category: ['Alnd'],
      },
      {
        entryType: 'surgery',
        cancerType: [CancerType.BREAST],
        code: '69031006',
        display: 'Excision of breast tissue (procedure)',
        system: SNOMED_CODE_URI,
        category: ['Mastectomy'],
      },
    ]);
    expect(convertFhirSurgeryProcedures(fhirEmptyBundle)).toEqual([]);
  });
});

describe('convertFhirTumorMarkers', () => {
  it('gets the tumor markers from a FHIR Bundle', () => {
    expect(convertFhirTumorMarkers(fhirTumorMarkerBundle)).toEqual([
      {
        entryType: 'biomarkers',
        cancerType: [CancerType.BREAST, CancerType.LUNG],
        code: '40556-3',
        display: 'Estrogen receptor Ag [Presence] in Tissue by Immune stain',
        system: LOINC_CODE_URI,
        category: ['ER'],
        qualifier: { system: SNOMED_CODE_URI, code: '10828004', display: 'Positive (qualifier value)' },
      },
      {
        entryType: 'biomarkers',
        cancerType: [CancerType.BREAST, CancerType.LUNG],
        code: '40557-1',
        display: 'Progesterone receptor Ag [Presence] in Tissue by Immune stain',
        system: LOINC_CODE_URI,
        category: ['PR'],
        qualifier: { system: SNOMED_CODE_URI, code: '10828004', display: 'Positive (qualifier value)' },
      },
      {
        entryType: 'biomarkers',
        cancerType: [CancerType.BREAST, CancerType.LUNG],
        code: '18474-7',
        display: 'HER2 Ag [Presence] in Tissue by Immune stain',
        system: LOINC_CODE_URI,
        category: ['HER2'],
        qualifier: { system: SNOMED_CODE_URI, code: '260385009', display: 'Negative (qualifier value)' },
      },
      {
        cancerType: [CancerType.COLON],
        entryType: 'biomarkers',
        code: '62862-8',
        display: 'Microsatellite instability [Presence] in Tissue by Immune stain',
        system: LOINC_CODE_URI,
        category: ['MSI'],
        qualifier: { system: SNOMED_CODE_URI, code: '10828004', display: 'Positive (qualifier value)' },
      },
      {
        entryType: 'biomarkers',
        cancerType: [CancerType.BREAST, CancerType.LUNG],
        code: '48676-1',
        display: 'HER2 [Interpretation] in Tissue',
        system: LOINC_CODE_URI,
        category: ['HER2'],
        qualifier: { system: SNOMED_CODE_URI, code: '260385009', display: 'Negative (qualifier value)' },
      },
      {
        entryType: 'biomarkers',
        cancerType: [CancerType.BREAST, CancerType.LUNG],
        code: '85319-2',
        display: 'HER2 [Presence] in Breast cancer specimen by Immune stain',
        system: LOINC_CODE_URI,
        category: ['HER2'],
        qualifier: { system: SNOMED_CODE_URI, code: '260385009', display: 'Negative (qualifier value)' },
      },
      {
        entryType: 'biomarkers',
        cancerType: [CancerType.COLON],
        code: '85318-4',
        display: 'ERBB2 gene duplication [Presence] in Breast cancer specimen by FISH',
        system: LOINC_CODE_URI,
        category: ['ERBB2_HER2', 'HER2'],
        qualifier: { system: SNOMED_CODE_URI, code: '260385009', display: 'Negative (qualifier value)' },
      },
      {
        entryType: 'biomarkers',
        cancerType: [CancerType.BREAST, CancerType.LUNG],
        code: '16112-5',
        display: 'Estrogen receptor [Interpretation] in Tissue',
        system: LOINC_CODE_URI,
        category: ['ER'],
        qualifier: { system: SNOMED_CODE_URI, code: '10828004', display: 'Positive (qualifier value)' },
      },
      {
        entryType: 'biomarkers',
        cancerType: [CancerType.BREAST, CancerType.LUNG],
        code: '85337-4',
        display: 'Estrogen receptor Ag [Presence] in Breast cancer specimen by Immune stain',
        system: LOINC_CODE_URI,
        category: ['ER'],
        qualifier: { system: SNOMED_CODE_URI, code: '10828004', display: 'Positive (qualifier value)' },
      },
    ]);
    expect(convertFhirTumorMarkers(fhirEmptyBundle)).toEqual([]);
  });
});

describe('isEqualCodedValueType()', () => {
  it('returns true if two values are equal', () => {
    expect(
      // Same codes but with the categories flipped
      isEqualCodedValueType(
        {
          cancerType: [CancerType.BRAIN, CancerType.BREAST],
          category: ['category1', 'category2'],
          code: 'code',
          display: 'display',
          entryType: 'cancerType',
          system: 'http://snomed.info/sct',
        },
        {
          cancerType: [CancerType.BRAIN, CancerType.BREAST],
          category: ['category1', 'category2'],
          code: 'code',
          display: 'display',
          entryType: 'cancerType',
          system: 'http://snomed.info/sct',
        }
      )
    ).toBe(true);
  });
  it('returns false if values are not equal', () => {
    expect(
      // Same codes but with the categories flipped
      isEqualCodedValueType(
        {
          cancerType: [CancerType.BRAIN, CancerType.BREAST],
          category: ['category1', 'category2'],
          code: 'code',
          display: 'display',
          entryType: 'cancerType',
          system: 'http://snomed.info/sct',
        },
        {
          cancerType: [CancerType.BRAIN, CancerType.BREAST, CancerType.COLON],
          category: ['category1', 'category2', 'category3'],
          code: 'code',
          display: 'display',
          entryType: 'cancerType',
          system: 'http://snomed.info/sct',
        }
      )
    ).toBe(false);
  });
  it('checkes if two values are equal even if values are out of order', () => {
    expect(
      // Same codes but with the categories flipped
      isEqualCodedValueType(
        {
          cancerType: [CancerType.BRAIN, CancerType.BREAST],
          category: ['category1', 'category2'],
          code: 'code',
          display: 'display',
          entryType: 'cancerType',
          system: 'http://snomed.info/sct',
        },
        {
          cancerType: [CancerType.BREAST, CancerType.BRAIN],
          category: ['category2', 'category1'],
          code: 'code',
          display: 'display',
          entryType: 'cancerType',
          system: 'http://snomed.info/sct',
        }
      )
    ).toBe(true);
  });
});
