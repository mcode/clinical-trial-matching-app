import { MutableRefObject, ReactElement } from 'react';
import { Typography } from '@mui/material';

import Study from './Study';
import { SavedStudiesState, SaveStudyHandler } from './types';
import { StudyDetailProps } from '.';

export type ResultsProps = {
  entries: StudyDetailProps[];
  state: SavedStudiesState;
  errors?: ErrorResponse[];
  handleSaveStudy: (study: StudyDetailProps) => SaveStudyHandler;
  scrollableParent: MutableRefObject<HTMLElement>;
};

export type ErrorResponse = {
  status: string;
  response: string;
  serviceName: string;
  error?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const Results = ({ entries, state, handleSaveStudy, ...props }: ResultsProps): ReactElement => (
  <>
    <Typography fontWeight="normal" mb={2} variant="h6">
      We found
      <Typography color="common.blueDarker" component="span" fontWeight={700} variant="h6">
        {` ${entries.length} `}
      </Typography>
      matching trials...
    </Typography>

    {entries.map((entry: StudyDetailProps) => (
      <Study
        {...props}
        key={entry.trialId}
        entry={entry}
        handleSaveStudy={handleSaveStudy(entry)}
        isStudySaved={state.has(entry.trialId)}
      />
    ))}
  </>
);

export default Results;
