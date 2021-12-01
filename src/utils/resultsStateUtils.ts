import { Bundle, BundleEntry, ResearchStudy } from 'fhir/r4';
import { SavedStudiesAction, SavedStudiesState } from '../components/Results/types';

export const uninitializedState: SavedStudiesState = {
  ids: new Set<string>(),
  savedStudies: [],
};

const getSavedStudies = (studies: ResearchStudy[], ids: Set<string>): ResearchStudy[] =>
  studies.filter(study => ids.has(study.id));

export const savedStudiesReducer = (state: SavedStudiesState, action: SavedStudiesAction): SavedStudiesState => {
  const { study = null, studies } = { ...action.value };
  switch (action.type) {
    case 'setInitialState':
      return {
        ids: new Set<string>(),
        savedStudies: studies,
      };
    case 'toggleSave':
      const alreadySavedStudy = state.ids.has(study.id);
      if (!alreadySavedStudy) {
        const ids = state.ids.add(study.id);
        const savedStudies = getSavedStudies(studies, ids);
        return { ...state, ids, savedStudies };
      } else {
        const ids = new Set<string>(state.ids);
        ids.delete(study.id);
        const count = ids.size;
        const savedStudies = count !== 0 ? getSavedStudies(studies, ids) : studies;
        return { ...state, ids, savedStudies };
      }
  }
};

export const getStudies = (results: Bundle): ResearchStudy[] => {
  const entries: BundleEntry[] = results?.entry || [];
  const studies = entries
    .filter(({ resource }) => resource?.resourceType === 'ResearchStudy')
    .map(({ resource }) => resource as ResearchStudy);
  return studies;
};
