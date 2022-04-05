import mockSearchResults from '@/__mocks__/resultDetails.json';
import { StudyDetailProps } from '@/components/Results/types';
import { getFilteredResults, getFilterOptions, getSortedResults } from '../filterUtils';
import { ResearchStudy } from 'fhir/r4';

const results = mockSearchResults.results as StudyDetailProps[];
const idsOfOriginalResults = ['NCT02684032', 'NCT03473639', 'NCT03964532', 'NCT03641755', 'NCT03959891', 'NCT03990896'];

const getMiles = (study: StudyDetailProps): number => study.closestFacilities?.[0]?.distance?.quantity;
const getLikelihood = (study: StudyDetailProps): number => study.likelihood.score;
const getTrialId = (study: StudyDetailProps): string => study.trialId;

describe('getSortedResults', () => {
  it('does not sort when no sorting options are supplied', () => {
    const actual = getSortedResults(results, [], []);
    expect(actual.map(getTrialId)).toEqual(idsOfOriginalResults);
  });

  it('sorts by match likelihood in descending order', () => {
    const actual = getSortedResults(results, ['matchLikelihood'], []);
    expect(actual.map(getLikelihood)).toEqual([1, undefined, 0.46, 0.46, 0.46, 0]);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03473639',
      'NCT03990896',
      'NCT02684032',
      'NCT03641755',
      'NCT03959891',
      'NCT03964532',
    ]);
  });

  it('sorts by distance in ascending order', () => {
    const actual = getSortedResults(results, ['distance'], []);
    expect(actual.map(getMiles)).toEqual([0, 17, 17, 118.9, 215, undefined]);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03990896',
      'NCT03641755',
      'NCT03959891',
      'NCT03964532',
      'NCT03473639',
      'NCT02684032',
    ]);
  });

  it('sorts by saved status from saved to unsaved trials', () => {
    const actual = getSortedResults(results, ['savedStatus'], ['NCT03964532', 'NCT03959891']);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03964532',
      'NCT03959891',
      'NCT02684032',
      'NCT03473639',
      'NCT03641755',
      'NCT03990896',
    ]);
  });

  it('sorts by match likelihood and distance', () => {
    const actual = getSortedResults(results, ['matchLikelihood', 'distance'], []);
    expect(actual.map(getLikelihood)).toEqual([undefined, 1, 0.46, 0.46, 0.46, 0]);
    expect(actual.map(getMiles)).toEqual([0, 215, 17, 17, undefined, 118.9]);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03990896',
      'NCT03473639',
      'NCT03641755',
      'NCT03959891',
      'NCT02684032',
      'NCT03964532',
    ]);
  });

  it('sorts by saved status and match likelihood', () => {
    const actual = getSortedResults(results, ['matchLikelihood', 'savedStatus'], ['NCT03964532', 'NCT03959891']);
    expect(actual.map(getLikelihood)).toEqual([0.46, 0, 1, undefined, 0.46, 0.46]);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03959891',
      'NCT03964532',
      'NCT03473639',
      'NCT03990896',
      'NCT02684032',
      'NCT03641755',
    ]);
  });

  it('sorts by saved status and distance', () => {
    const actual = getSortedResults(results, ['distance', 'savedStatus'], ['NCT03964532', 'NCT03959891']);
    expect(actual.map(getMiles)).toEqual([17, 118.9, 0, 17, 215, undefined]);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03959891',
      'NCT03964532',
      'NCT03990896',
      'NCT03641755',
      'NCT03473639',
      'NCT02684032',
    ]);
  });

  it('sorts by saved status, match likelihood, and distance', () => {
    const actual = getSortedResults(
      results,
      ['matchLikelihood', 'distance', 'savedStatus'],
      ['NCT03641755', 'NCT03964532']
    );
    expect(actual.map(getLikelihood)).toEqual([0.46, 0, undefined, 1, 0.46, 0.46]);
    expect(actual.map(getMiles)).toEqual([17, 118.9, 0, 215, 17, undefined]);
    expect(actual.map(getTrialId)).toEqual([
      'NCT03641755',
      'NCT03964532',
      'NCT03990896',
      'NCT03473639',
      'NCT03959891',
      'NCT02684032',
    ]);
  });
});

describe('getFilteredResults', () => {
  it('does not filter when no filter options are supplied', () => {
    const parameters = {
      sortingOptions: [],
      recruitmentStatus: [],
      trialPhase: [],
      studyType: [],
    };
    const actual = getFilteredResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual(idsOfOriginalResults);
  });

  it('filters by recruitment status', () => {
    const parameters = {
      sortingOptions: [],
      recruitmentStatus: ['active'] as ResearchStudy['status'][],
      trialPhase: [],
      studyType: [],
    };
    const actual = getFilteredResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual(['NCT03473639', 'NCT03964532', 'NCT03641755', 'NCT03959891', 'NCT03990896']);
  });

  it('filters by trial phase', () => {
    const parameters = {
      sortingOptions: [],
      recruitmentStatus: [],
      trialPhase: ['Phase 1'],
      studyType: [],
    };
    const actual = getFilteredResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual(['NCT02684032', 'NCT03473639', 'NCT03959891']);
  });

  it('filters by study type', () => {
    const parameters = {
      sortingOptions: [],
      recruitmentStatus: [],
      trialPhase: [],
      studyType: ['Observational'],
    };
    const actual = getFilteredResults(results, parameters);
    expect(actual.map(getTrialId)).toEqual([]);
  });

  it('filters by recruitment status, trial phase, and study type', () => {
    const parameters = {
      sortingOptions: [],
      recruitmentStatus: ['active'] as ResearchStudy['status'][],
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
        sortingOptions: [],
        recruitmentStatus: [],
        trialPhase: [],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 5 },
          { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
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
        sortingOptions: [],
        recruitmentStatus: ['active'] as ResearchStudy['status'][],
        trialPhase: [],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 5 },
          { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
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
        sortingOptions: [],
        recruitmentStatus: ['in-review'] as ResearchStudy['status'][],
        trialPhase: [],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 5 },
          { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
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
        sortingOptions: [],
        recruitmentStatus: [],
        trialPhase: ['Phase 1'],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 2 },
          { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
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
        sortingOptions: [],
        recruitmentStatus: [],
        trialPhase: ['Phase 3'],
        studyType: [],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 0 },
          { name: 'closed-to-accrual', label: 'Closed to accrual', count: 0 },
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
        sortingOptions: [],
        recruitmentStatus: [],
        trialPhase: [],
        studyType: ['Interventional'],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 5 },
          { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
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
        sortingOptions: [],
        recruitmentStatus: [],
        trialPhase: [],
        studyType: ['Observational'],
      })
    ).toEqual(
      expect.objectContaining({
        recruitmentStatus: expect.arrayContaining([
          { name: 'active', label: 'Active', count: 0 },
          { name: 'closed-to-accrual', label: 'Closed to accrual', count: 0 },
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
        sortingOptions: [],
        recruitmentStatus: ['closed-to-accrual'] as ResearchStudy['status'][],
        trialPhase: ['Phase 1'],
        studyType: [],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 2 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
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
        sortingOptions: [],
        recruitmentStatus: ['in-review'] as ResearchStudy['status'][],
        trialPhase: ['Phase 1'],
        studyType: [],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 2 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
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
        sortingOptions: [],
        recruitmentStatus: ['in-review'] as ResearchStudy['status'][],
        trialPhase: ['Phase 3'],
        studyType: [],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 0 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 0 },
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
        sortingOptions: [],
        recruitmentStatus: ['closed-to-accrual'] as ResearchStudy['status'][],
        trialPhase: [],
        studyType: ['Interventional'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 5 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
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
        sortingOptions: [],
        recruitmentStatus: ['in-review'] as ResearchStudy['status'][],
        trialPhase: [],
        studyType: ['Interventional'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 5 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
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
        sortingOptions: [],
        recruitmentStatus: ['in-review'] as ResearchStudy['status'][],
        trialPhase: [],
        studyType: ['Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 0 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 0 },
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
        sortingOptions: [],
        recruitmentStatus: [],
        trialPhase: ['Phase 2'],
        studyType: ['Interventional'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 1 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 0 },
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
        sortingOptions: [],
        recruitmentStatus: [],
        trialPhase: ['Phase 2'],
        studyType: ['Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 0 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 0 },
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
        sortingOptions: [],
        recruitmentStatus: [],
        trialPhase: ['Phase 3'],
        studyType: ['Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 0 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 0 },
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
        sortingOptions: [],
        recruitmentStatus: ['active'] as ResearchStudy['status'][],
        trialPhase: ['Phase 1/Phase 2'],
        studyType: ['Interventional', 'Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 2 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 0 },
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
        sortingOptions: [],
        recruitmentStatus: ['in-review'] as ResearchStudy['status'][],
        trialPhase: ['Phase 1/Phase 2'],
        studyType: ['Interventional', 'Observational'],
      })
    ).toEqual({
      recruitmentStatus: expect.arrayContaining([
        { name: 'active', label: 'Active', count: 2 },
        { name: 'closed-to-accrual', label: 'Closed to accrual', count: 0 },
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
