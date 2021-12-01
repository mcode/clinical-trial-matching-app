import { getStudies, savedStudiesReducer, uninitializedState } from '../resultsStateUtils';
import mockSearchResults from '@/__mocks__/results.json';
import mockStudies from '@/__mocks__/studies.json';
import { Bundle, ResearchStudy } from 'fhir/r4';

describe('savedStudiesReducer', () => {
  const studies = mockStudies as ResearchStudy[];

  it('sets the initial state based on the supplied list of studies', () => {
    expect(savedStudiesReducer(uninitializedState, { type: 'setInitialState', value: { studies } })).toEqual({
      ids: new Set<string>(),
      savedStudies: studies,
    });
  });

  it('saves a study when it is not already selected and after already having selected a study', () => {
    expect(
      savedStudiesReducer(
        { ids: new Set<string>(['NCT02684032']), savedStudies: [studies[0]] },
        { type: 'toggleSave', value: { study: studies[2], studies } }
      )
    ).toEqual({
      ids: new Set<string>(['NCT02684032', 'NCT03964532']),
      savedStudies: [studies[0], studies[2]],
    });
  });

  it('saves a study when it is not already selected and after not having any selected studies', () => {
    expect(
      savedStudiesReducer(
        { ids: new Set<string>(), savedStudies: studies },
        { type: 'toggleSave', value: { study: studies[0], studies } }
      )
    ).toEqual({ ids: new Set<string>(['NCT02684032']), savedStudies: [studies[0]] });
  });

  it('unsaves a study when it is already is selected', () => {
    expect(
      savedStudiesReducer(
        {
          ids: new Set<string>(['NCT02684032', 'NCT03964532']),
          savedStudies: [studies[0], studies[2]],
        },
        { type: 'toggleSave', value: { study: studies[2], studies } }
      )
    ).toEqual({ ids: new Set<string>(['NCT02684032']), savedStudies: [studies[0]] });
  });

  it('saves all studies when no studies are selected', () => {
    expect(
      savedStudiesReducer(
        { ids: new Set<string>(['NCT02684032']), savedStudies: [studies[0]] },
        { type: 'toggleSave', value: { study: studies[0], studies } }
      )
    ).toEqual({ ids: new Set<string>(), savedStudies: studies });
  });
});

describe('getStudies', () => {
  it('gets all the ResearchStudy resources from a Bundle', () => {
    const results = mockSearchResults as Bundle;
    const studies = mockStudies as ResearchStudy[];
    expect(getStudies(results)).toEqual(studies);
  });
});
