import { ReactElement } from 'react';
import { Typography } from '@mui/material';

import Study from './Study';
import { SavedStudiesState, SaveStudyHandler } from './types';
import { BundleEntry } from './types';

export type ResultsProps = {
  entries: BundleEntry[];
  state: SavedStudiesState;
  handleSaveStudy: (study: BundleEntry) => SaveStudyHandler;
};

const Results = ({ entries, state, handleSaveStudy }: ResultsProps): ReactElement => (
  <>
    <Typography fontWeight="normal" mb={2} variant="h6">
      We found
      <Typography color="common.blueDarker" component="span" fontWeight={700} variant="h6">
        {` ${entries.length} `}
      </Typography>
      matching trials...
    </Typography>

    {entries.map((entry: BundleEntry) => (
      <Study
        key={entry.resource.id}
        entry={entry}
        handleSaveStudy={handleSaveStudy(entry)}
        isStudySaved={state.has(entry.resource.id)}
      />
    ))}
  </>
);

export default Results;
