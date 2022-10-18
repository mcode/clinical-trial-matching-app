import { StudyDetailProps } from '@/components/Results/types';
import { searchParameters } from '@/pages/api/_tests_/clinical-trial-search.test';
import mockSearchResults from '@/__mocks__/resultDetails.json';
import * as fhirConstants from '../fhirConstants';
import { CodedValueType } from '../fhirConversionUtils';
import { convertCodedValueToMedicationStatement, convertCodedValueToObervation } from '../fhirFilter';
import { getFilteredResults, getFilterOptions, getSortedResults } from '../filterUtils';

const results = mockSearchResults.results as StudyDetailProps[];
const idsOfOriginalResults = ['NCT02684032', 'NCT03473639', 'NCT03964532', 'NCT03641755', 'NCT03959891', 'NCT03990896'];

const getMiles = (study: StudyDetailProps): number => study.closestFacilities?.[0]?.distance?.quantity;
const getLikelihood = (study: StudyDetailProps): number => study.likelihood.score;
const getTrialId = (study: StudyDetailProps): string => study.trialId;

describe('getSortedResults', () => {
  it('does not sort when no sorting option is supplied', () => {
    const parameters = {
      sortingOption: '',
      savedStudies: [],
    };
    const actual = getSortedResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual(idsOfOriginalResults);
  });

  it('sorts by match likelihood in descending order, distance in ascending order, and saved status from saved to unsaved trials', () => {
    const parameters = {
      sortingOption: 'matchLikelihood',
      savedStudies: [],
    };
    const actual = getSortedResults(results, parameters);
    expect(actual.map(getLikelihood)).toEqual([1, 0.5, 0.46, 0.46, 0.46, 0]);
    expect(actual.map(getMiles)).toEqual([215, 0, 17, 17, undefined, 118.9]);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03473639',
      'NCT03990896',
      'NCT03641755',
      'NCT03959891',
      'NCT02684032',
      'NCT03964532',
    ]);
  });

  it('sorts by distance in ascending order, match likelihood in descending order, and saved status from saved to unsaved trials', () => {
    const parameters = {
      sortingOption: 'distance',
      savedStudies: [],
    };
    const actual = getSortedResults(results, parameters);
    expect(actual.map(getMiles)).toEqual([0, 17, 17, 118.9, 215, undefined]);
    expect(actual.map(getLikelihood)).toEqual([0.5, 0.46, 0.46, 0, 1, 0.46]);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03990896',
      'NCT03641755',
      'NCT03959891',
      'NCT03964532',
      'NCT03473639',
      'NCT02684032',
    ]);
  });

  it('sorts by saved status from saved to unsaved trials, match likelihood in descending order, and distance in ascending order', () => {
    const parameters = {
      sortingOption: 'savedStatus',
      savedStudies: ['NCT03964532', 'NCT03959891'],
    };
    const actual = getSortedResults(results, parameters);
    expect(actual.map(getLikelihood)).toEqual([0.46, 0, 1, 0.5, 0.46, 0.46]);
    expect(actual.map(getMiles)).toEqual([17, 118.9, 215, 0, 17, undefined]);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03959891',
      'NCT03964532',
      'NCT03473639',
      'NCT03990896',
      'NCT03641755',
      'NCT02684032',
    ]);
  });
});

describe('getFilteredResults', () => {
  it('does not filter when no filter options are supplied', () => {
    const parameters = {
      recruitmentStatus: [],
      trialPhase: [],
      studyType: [],
    };
    const actual = getFilteredResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual(idsOfOriginalResults);
  });

  it('filters by recruitment status', () => {
    const parameters = {
      recruitmentStatus: ['active'],
      trialPhase: [],
      studyType: [],
    };
    const actual = getFilteredResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual(['NCT03473639', 'NCT03964532', 'NCT03641755', 'NCT03959891', 'NCT03990896']);
  });

  it('filters by trial phase', () => {
    const parameters = {
      recruitmentStatus: [],
      trialPhase: ['Phase 1'],
      studyType: [],
    };
    const actual = getFilteredResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual(['NCT02684032', 'NCT03473639', 'NCT03959891']);
  });

  it('filters by study type', () => {
    const parameters = {
      recruitmentStatus: [],
      trialPhase: [],
      studyType: ['Observational'],
    };
    const actual = getFilteredResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual([]);
  });

  it('filters by recruitment status, trial phase, and study type', () => {
    const parameters = {
      recruitmentStatus: ['active'],
      trialPhase: ['Phase 1/Phase 2'],
      studyType: ['Interventional', 'Observational'],
    };
    const actual = getFilteredResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual(['NCT03964532', 'NCT03641755']);
  });
});

describe('getFilterOptions', () => {
  it('gets filter options counting the total amount of studies when no parameters are supplied', () => {
    expect(
      getFilterOptions(results, {
        recruitmentStatus: [],
        trialPhase: [],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 5 },
          { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
        ]),
        trialPhase: expect.arrayContaining([
          { name: 'Phase 1', count: 3 },
          { name: 'Phase 1/Phase 2', count: 2 },
          { name: 'Phase 2', count: 1 },
        ]),
        studyType: expect.arrayContaining([{ name: 'Interventional', count: 6 }]),
      })
    );
  });

  it('gets filter options by only selecting recruitment status', () => {
    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['active'],
        trialPhase: [],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 5 },
          { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
        ]),
        trialPhase: expect.arrayContaining([
          { name: 'Phase 1', count: 2 },
          { name: 'Phase 1/Phase 2', count: 2 },
          { name: 'Phase 2', count: 1 },
        ]),
        studyType: expect.arrayContaining([{ name: 'Interventional', count: 5 }]),
      })
    );

    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['in-review'],
        trialPhase: [],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 5 },
          { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
        ]),
        trialPhase: expect.arrayContaining([
          { name: 'Phase 1', count: 0 },
          { name: 'Phase 1/Phase 2', count: 0 },
          { name: 'Phase 2', count: 0 },
        ]),
        studyType: expect.arrayContaining([{ name: 'Interventional', count: 0 }]),
      })
    );
  });

  it('gets filter options by only selecting trial phase', () => {
    expect(
      getFilterOptions(results, {
        recruitmentStatus: [],
        trialPhase: ['Phase 1'],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 2 },
          { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
        ]),
        trialPhase: expect.arrayContaining([
          { name: 'Phase 1', count: 3 },
          { name: 'Phase 1/Phase 2', count: 2 },
          { name: 'Phase 2', count: 1 },
        ]),
        studyType: expect.arrayContaining([{ name: 'Interventional', count: 3 }]),
      })
    );

    expect(
      getFilterOptions(results, {
        recruitmentStatus: [],
        trialPhase: ['Phase 3'],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 0 },
          { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 0 },
        ]),
        trialPhase: expect.arrayContaining([
          { name: 'Phase 1', count: 3 },
          { name: 'Phase 1/Phase 2', count: 2 },
          { name: 'Phase 2', count: 1 },
        ]),
        studyType: expect.arrayContaining([{ name: 'Interventional', count: 0 }]),
      })
    );
  });

  it('gets filter options by only selecting study type', () => {
    expect(
      getFilterOptions(results, {
        recruitmentStatus: [],
        trialPhase: [],
        studyType: ['Interventional'],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 5 },
          { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
        ]),
        trialPhase: expect.arrayContaining([
          { name: 'Phase 1', count: 3 },
          { name: 'Phase 1/Phase 2', count: 2 },
          { name: 'Phase 2', count: 1 },
        ]),
        studyType: expect.arrayContaining([{ name: 'Interventional', count: 6 }]),
      })
    );

    expect(
      getFilterOptions(results, {
        recruitmentStatus: [],
        trialPhase: [],
        studyType: ['Observational'],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 0 },
          { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 0 },
        ]),
        trialPhase: expect.arrayContaining([
          { name: 'Phase 1', count: 0 },
          { name: 'Phase 1/Phase 2', count: 0 },
          { name: 'Phase 2', count: 0 },
        ]),
        studyType: expect.arrayContaining([{ name: 'Interventional', count: 6 }]),
      })
    );
  });

  it('gets filter options by selecting recruitment status and trial phase', () => {
    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['closed-to-accrual'],
        trialPhase: ['Phase 1'],
        studyType: [],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 2 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 1 },
        { name: 'Phase 1/Phase 2', count: 0 },
        { name: 'Phase 2', count: 0 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 1 }]),
    });

    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['in-review'],
        trialPhase: ['Phase 1'],
        studyType: [],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 2 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 0 },
        { name: 'Phase 1/Phase 2', count: 0 },
        { name: 'Phase 2', count: 0 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 0 }]),
    });

    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['in-review'],
        trialPhase: ['Phase 3'],
        studyType: [],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 0 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 0 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 0 },
        { name: 'Phase 1/Phase 2', count: 0 },
        { name: 'Phase 2', count: 0 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 0 }]),
    });
  });

  it('gets filter options by selecting recruitment status and study type', () => {
    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['closed-to-accrual'],
        trialPhase: [],
        studyType: ['Interventional'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 5 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 1 },
        { name: 'Phase 1/Phase 2', count: 0 },
        { name: 'Phase 2', count: 0 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 1 }]),
    });

    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['in-review'],
        trialPhase: [],
        studyType: ['Interventional'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 5 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 0 },
        { name: 'Phase 1/Phase 2', count: 0 },
        { name: 'Phase 2', count: 0 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 0 }]),
    });

    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['in-review'],
        trialPhase: [],
        studyType: ['Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 0 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 0 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 0 },
        { name: 'Phase 1/Phase 2', count: 0 },
        { name: 'Phase 2', count: 0 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 0 }]),
    });
  });

  it('gets filter options by selecting trial phase and study type', () => {
    expect(
      getFilterOptions(results, {
        recruitmentStatus: [],
        trialPhase: ['Phase 2'],
        studyType: ['Interventional'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 1 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 0 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 3 },
        { name: 'Phase 1/Phase 2', count: 2 },
        { name: 'Phase 2', count: 1 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 1 }]),
    });

    expect(
      getFilterOptions(results, {
        recruitmentStatus: [],
        trialPhase: ['Phase 2'],
        studyType: ['Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 0 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 0 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 0 },
        { name: 'Phase 1/Phase 2', count: 0 },
        { name: 'Phase 2', count: 0 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 1 }]),
    });

    expect(
      getFilterOptions(results, {
        recruitmentStatus: [],
        trialPhase: ['Phase 3'],
        studyType: ['Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 0 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 0 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 0 },
        { name: 'Phase 1/Phase 2', count: 0 },
        { name: 'Phase 2', count: 0 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 0 }]),
    });
  });

  it('gets filter options by selecting recruitment status, trial phase, and study type', () => {
    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['active'],
        trialPhase: ['Phase 1/Phase 2'],
        studyType: ['Interventional', 'Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 2 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 0 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 2 },
        { name: 'Phase 1/Phase 2', count: 2 },
        { name: 'Phase 2', count: 1 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 2 }]),
    });

    expect(
      getFilterOptions(results, {
        recruitmentStatus: ['in-review'],
        trialPhase: ['Phase 1/Phase 2'],
        studyType: ['Interventional', 'Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 2 },
        { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 0 },
      ]),
      trialPhase: expect.arrayContaining([
        { name: 'Phase 1', count: 0 },
        { name: 'Phase 1/Phase 2', count: 0 },
        { name: 'Phase 2', count: 0 },
      ]),
      studyType: expect.arrayContaining([{ name: 'Interventional', count: 0 }]),
    });
  });
});

const expectedMedicalStatmentResource = {
  resourceType: 'MedicationStatement',
  id: 'mcode-cancer-related-medication-statement',
  subject: {
    id: '0',
    gender: 'other',
    name: 'search_name',
    age: '0',
    zipcode: '00000',
  },
  status: 'completed',
  medicationCodeableConcept: {
    coding: [
      {
        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
        code: '1657775',
        display: '10 ML ramucirumab 10 MG/ML Injection',
      },
    ],
  },
  meta: {
    profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-statement'],
  },
};
const expectedObservationResource = {
  resourceType: 'Observation',
  id: 'mcode-tumor-marker',
  status: 'completed',
  subject: {
    age: '0',
    gender: 'other',
    id: '0',
    name: 'search_name',
    zipcode: '00000',
  },
  coding: [
    {
      system: 'http://snomed.info/sct',
      code: '343721370305',
      display: 'HER2 panel - tissue by fish',
    },
  ],
  meta: {
    profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tumor-marker'],
  },
};

describe('convertCodedValueToObervation', () => {
  let id = 'mcode-tumor-marker';
  let profile_value = fhirConstants.MCODE_TUMOR_MARKER;
  let codingSystem = 'http://snomed.info/sct';
  let codedValue: CodedValueType = JSON.parse(searchParameters.biomarkers);
  const observationResource = convertCodedValueToObervation({
    codedValue,
    id,
    profile_value,
    codingSystem,
  });
  it('Observation Resource Returned', () => {
    expect(observationResource).toEqual(expectedObservationResource);
  });

  id = 'mcode-cancer-related-medication-statement';
  profile_value = fhirConstants.MCODE_CANCER_RELATED_MEDICATION_STATEMENT;
  codingSystem = 'http://www.nlm.nih.gov/research/umls/rxnorm';
  codedValue = JSON.parse(searchParameters.medications);

  const medicalStatementResource = convertCodedValueToMedicationStatement({
    codedValue,
    id,
    profile_value,
    codingSystem,
  });
  it('Medication Statement Returned', () => {
    expect(JSON.stringify(medicalStatementResource)).toEqual(JSON.stringify(expectedMedicalStatmentResource));
  });
});
