import { ReactElement } from 'react';
import { Typography } from '@mui/material';

import Study from './Study';
import { ContactProps, SavedStudiesState, SaveStudyHandler } from './types';
import { BundleEntry } from './types';

export type ResultsProps = {
  entries: BundleEntry[];
  state: SavedStudiesState;
  errors?: ErrorResponse[];
  handleSaveStudy: (study: BundleEntry) => SaveStudyHandler;
  closestFacilities: ContactProps[];
};

export type ErrorResponse = {
  status: string;
  response: string;
  serviceName: string;
  error?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const Results = ({ entries, state, handleSaveStudy, closestFacilities }: ResultsProps): ReactElement => (
  <>
    <Typography fontWeight="normal" mb={2} variant="h6">
      We found
      <Typography color="common.blueDarker" component="span" fontWeight={700} variant="h6">
        {` ${entries.length} `}
      </Typography>
      matching trials...
    </Typography>

    {entries.map((entry: BundleEntry, index: number) => (
      <Study
        key={entry.resource.id}
        entry={entry}
        handleSaveStudy={handleSaveStudy(entry)}
        isStudySaved={state.has(entry.resource.id)}
        closestFacility={closestFacilities[index]}
      />
    ))}
  </>
);

export default Results;
