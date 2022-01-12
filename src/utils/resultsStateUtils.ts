import { SavedStudiesAction, SavedStudiesState, BundleEntry } from '../components/Results/types';

export const uninitializedState: SavedStudiesState = new Set<string>();

export const getSavedStudies = (entries: BundleEntry[], ids: Set<string>): BundleEntry[] => {
  const count = ids.size;
  if (count !== 0) {
    return entries.filter(({ resource }) => ids.has(resource.id));
  }
  return entries;
};

export const savedStudiesReducer = (state: SavedStudiesState, action: SavedStudiesAction): SavedStudiesState => {
  switch (action.type) {
    case 'setInitialState':
      return uninitializedState;
    case 'toggleSave':
      const alreadySavedStudy = state.has(action.value.resource.id);
      const updated = new Set<string>(state);
      if (!alreadySavedStudy) {
        return updated.add(action.value.resource.id);
      } else {
        updated.delete(action.value.resource.id);
        return updated;
      }
  }
};
