import {
  fhirEcogPerformanceStatusBundle,
  fhirEmptyBundle,
  fhirKarnofskyPerformanceStatusBundle,
  fhirMedicationStatementBundle,
  fhirPatient,
  fhirPrimaryCancerConditionBundle,
  fhirPrimaryCancerConditionBundle2,
  fhirRadiationProcedureBundle,
  fhirSecondaryCancerConditionBundle,
  fhirSurgeryProcedureBundle,
  fhirTumorMarkerBundle,
} from '@/__mocks__/bundles';
import mockPatient from '@/__mocks__/patient';
import {
  convertFhirEcogPerformanceStatus,
  convertFhirKarnofskyPerformanceStatus,
  convertFhirMedicationStatements,
  convertFhirPatient,
  convertFhirPrimaryCancerCondition,
  convertFhirRadiationProcedures,
  convertFhirSecondaryCancerConditions,
  convertFhirSurgeryProcedures,
  convertFhirTumorMarkers,
} from '../fhirConversionUtils';

describe('convertFhirKarnofskyPerformanceStatus', () => {
  it('gets the Karnofsky score from a bundle', () => {
    expect(convertFhirKarnofskyPerformanceStatus(fhirKarnofskyPerformanceStatusBundle)).toBe('100');
    expect(convertFhirKarnofskyPerformanceStatus(fhirEmptyBundle)).toBeNull();
  });
});

describe('convertFhirEcogPerformanceStatus', () => {
  it('gets the ECOG score from a FHIR bundle', () => {
    expect(convertFhirEcogPerformanceStatus(fhirEcogPerformanceStatusBundle)).toBe('1');
    expect(convertFhirEcogPerformanceStatus(fhirEmptyBundle)).toBeNull();
  });
});

describe('convertFhirMedicationStatements', () => {
  it('gets the medication statements from a FHIR bundle', () => {
    expect(convertFhirMedicationStatements(fhirMedicationStatementBundle)).toEqual([
      'leuprolide Injetable Product',
      'fulvestrant Injectable Product',
      'abemaciclib Oral Product',
      'ribociclib Oral Product',
    ]);
    expect(convertFhirMedicationStatements(fhirEmptyBundle)).toEqual([]);
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
    expect(convertFhirPrimaryCancerCondition(fhirPrimaryCancerConditionBundle)).toEqual({
      cancerType: { code: '408643008', display: 'Infiltrating duct carcinoma of breast (disorder)' },
      cancerSubtype: null,
      stage: 'IV',
    });
    expect(convertFhirPrimaryCancerCondition(fhirPrimaryCancerConditionBundle2)).toEqual({
      cancerType: { code: '254837009', display: 'Malignant neoplasm of breast (disorder)' },
      cancerSubtype: null,
      stage: 'IIA',
    });
    expect(convertFhirPrimaryCancerCondition(fhirEmptyBundle)).toEqual({
      cancerType: null,
      cancerSubtype: null,
      stage: null,
    });
  });
});

describe('convertFhirRadiationProcedures', () => {
  it('gets the radiation procedures from a FHIR Bundle', () => {
    expect(convertFhirRadiationProcedures(fhirRadiationProcedureBundle)).toEqual([
      'Megavoltage radiation therapy using photons (procedure)',
    ]);
    expect(convertFhirRadiationProcedures(fhirEmptyBundle)).toEqual([]);
  });
});

describe('convertFhirSecondaryCancerConditions', () => {
  it('gets the secondary cancer conditions from a FHIR Bundle', () => {
    expect(convertFhirSecondaryCancerConditions(fhirSecondaryCancerConditionBundle)).toEqual([
      'Secondary malignant neoplasm of bone (disorder)',
    ]);
    expect(convertFhirSecondaryCancerConditions(fhirEmptyBundle)).toEqual([]);
  });
});

describe('convertFhirSurgeryProcedures', () => {
  it('gets the surgery procedures from a FHIR Bundle', () => {
    expect(convertFhirSurgeryProcedures(fhirSurgeryProcedureBundle)).toEqual([
      'Partial mastectomy (procedure)',
      'Lumpectomy of breast (procedure)',
      'Excision of axillary lymph node (procedure)',
      'Excision of breast tissue (procedure)',
    ]);
    expect(convertFhirSurgeryProcedures(fhirEmptyBundle)).toEqual([]);
  });
});

describe('convertFhirTumorMarkers', () => {
  it('gets the tumor markers from a FHIR Bundle', () => {
    expect(convertFhirTumorMarkers(fhirTumorMarkerBundle)).toEqual([
      'ER Ag Tiss Ql ImStn +',
      'PR Ag Tiss Ql ImStn +',
      'Her2 Ag Tiss Ql ImStn -',
      'MSI Tiss Ql ImStn +',
      'Her2 Tiss-Imp -',
      'Her2 Br ca spec Ql ImStn -',
      'ERBB2 gene Dp Br ca spec Ql FISH -',
      'ER Tiss-Imp +',
      'ER Ag Br ca spec Ql ImStn +',
      'PR Tiss-Imp +',
      'PR Ag Br ca spec Ql ImStn +',
    ]);
    expect(convertFhirTumorMarkers(fhirEmptyBundle)).toEqual([]);
  });
});
