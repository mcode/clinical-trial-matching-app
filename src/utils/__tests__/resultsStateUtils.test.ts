import { StudyDetailProps } from '@/components/Results/types';
import mockSearchResults from '@/__mocks__/resultDetails.json';
import { getSavedStudies, savedStudiesReducer, uninitializedState } from '../resultsStateUtils';

describe('savedStudiesReducer', () => {
  const entries = mockSearchResults.results as StudyDetailProps[];

  it('resets to the initial state', () => {
    expect(savedStudiesReducer(new Set<string>(['NCT02684032']), { type: 'setInitialState' })).toEqual(
      uninitializedState
    );
  });

  it('unsaves a study when it is already is selected', () => {
    expect(
      savedStudiesReducer(new Set<string>(['NCT02684032', 'NCT03964532']), { type: 'toggleSave', value: entries[2] })
    ).toEqual(new Set<string>(['NCT02684032']));
  });

  it('saves a study when it is not already selected', () => {
    expect(savedStudiesReducer(new Set<string>(['NCT03964532']), { type: 'toggleSave', value: entries[0] })).toEqual(
      new Set<string>(['NCT02684032', 'NCT03964532'])
    );
  });
});

describe('getSavedStudies', () => {
  const entries = mockSearchResults.results as StudyDetailProps[];

  it('gets all studies when none are saved', () => {
    expect(getSavedStudies([entries[0], entries[2]], uninitializedState)).toEqual([entries[0], entries[2]]);
  });

  it('gets selected studies', () => {
    expect(getSavedStudies(entries, new Set<string>(['NCT02684032', 'NCT03964532']))).toEqual([entries[0], entries[2]]);
  });
});
