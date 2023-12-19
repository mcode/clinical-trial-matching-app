import { SavedStudiesAction, SavedStudiesState, StudyDetailProps } from '../components/Results/types';

export const uninitializedState: SavedStudiesState = new Set<string>();

export const getSavedStudies = (entries: StudyDetailProps[], ids: Set<string>): StudyDetailProps[] => {
  const count = ids.size;
  if (count !== 0) {
    return entries.filter(study => ids.has(study.trialId));
  }
  return entries;
};

export const savedStudiesReducer = (state: SavedStudiesState, action: SavedStudiesAction): SavedStudiesState => {
  switch (action.type) {
    case 'setInitialState':
      return uninitializedState;
    case 'toggleSave': {
      const alreadySavedStudy = state.has(action.value.trialId);
      const updated = new Set<string>(state);
      if (!alreadySavedStudy) {
        return updated.add(action.value.trialId);
      } else {
        updated.delete(action.value.trialId);
        return updated;
      }
    }
  }
};
