import {
  fhirEcogPerformanceStatusBundle,
  fhirEmptyBundle,
  fhirKarnofskyPerformanceStatusBundle,
  fhirPatient,
  fhirPrimaryCancerConditions,
  fhirPrimaryCancerConditions2,
  fhirRadiationProcedures,
  fhirSecondaryCancerConditions,
  fhirSurgeryProcedures,
  fhirTumorMarkerBundle,
} from '@/__mocks__/bundles';
import mockPatient from '@/__mocks__/patient';
import { LOINC_CODE_URI, SNOMED_CODE_URI } from '../fhirConstants';
import {
  CancerType,
  convertFhirEcogPerformanceStatus,
  convertFhirKarnofskyPerformanceStatus,
  convertFhirPatient,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  convertFhirTumorMarkers,
  extractPrimaryCancerCondition,
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

describe('convertFhirMedicationStatements', () => {
  it('gets the medication statements from a FHIR bundle', () => {
    fail('this test needs to be reimplemented');
    /*
    expect(convertFhirMedicationStatements(fhirMedicationStatementBundle)).toEqual([
      {
        cancerType: [CancerType.PROSTATE],
        category: ['leuprolide'],
        code: '1163443',
        display: 'leuprolide Injectable Product',
        entryType: 'medications',
        system: RXNORM_CODE_URI,
      },
      {
        cancerType: [CancerType.BREAST],
        category: ['fulvestrant'],
        code: '1156671',
        display: 'fulvestrant Injectable Product',
        entryType: 'medications',
        system: RXNORM_CODE_URI,
      },
      {
        cancerType: [CancerType.BREAST],
        category: ['abemaciclib'],
        code: '1946828',
        display: 'abemaciclib Pill',
        entryType: 'medications',
        system: RXNORM_CODE_URI,
      },
      {
        cancerType: [CancerType.BREAST],
        category: ['ribociclib'],
        code: '1873980',
        display: 'ribociclib Oral Product',
        entryType: 'medications',
        system: RXNORM_CODE_URI,
      },
    ]);
    expect(convertFhirMedicationStatements(fhirEmptyBundle)).toEqual([]);
    */
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
    expect(extractPrimaryCancerCondition(fhirPrimaryCancerConditions)).toEqual({
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
    expect(extractPrimaryCancerCondition(fhirPrimaryCancerConditions2)).toEqual({
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
    expect(extractPrimaryCancerCondition([])).toEqual(null);
  });
});

describe('convertFhirRadiationProcedures', () => {
  it('gets the radiation procedures from a FHIR Bundle', () => {
    expect(convertFhirRadiationProcedures(fhirRadiationProcedures)).toEqual([
      {
        entryType: 'radiation',
        cancerType: [CancerType.BREAST, CancerType.COLON, CancerType.LUNG],
        code: '879916008',
        display: 'Radiofrequency ablation (procedure)',
        system: SNOMED_CODE_URI,
        category: ['Ablation', 'rfa'],
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
    expect(convertFhirRadiationProcedures([])).toEqual([]);
  });
});

describe('convertFhirSecondaryCancerConditions', () => {
  it('gets the secondary cancer conditions from a FHIR Bundle', () => {
    expect(convertFhirSecondaryCancerConditions(fhirSecondaryCancerConditions)).toEqual([
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
        category: ['bone'],
      },
    ]);
    expect(convertFhirSecondaryCancerConditions([])).toEqual([]);
  });
});

describe('convertFhirSurgeryProcedures', () => {
  it('gets the surgery procedures from a FHIR Bundle', () => {
    expect(convertFhirSurgeryProcedures(fhirSurgeryProcedures)).toEqual([
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
    expect(convertFhirSurgeryProcedures([])).toEqual([]);
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
        category: ['msi'],
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
        category: ['erbb2_her2', 'HER2'],
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
