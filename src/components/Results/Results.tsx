import { ReactElement } from 'react';
import { ResearchStudy } from 'fhir/r4';
import { Typography } from '@mui/material';

import Study from './Study';
import { SavedStudiesState, SaveStudyHandler } from './types';

export type ResultsProps = {
  studies: ResearchStudy[];
  state: SavedStudiesState;
  handleSaveStudy: (study: ResearchStudy) => SaveStudyHandler;
};

const Results = ({ studies, state, handleSaveStudy }: ResultsProps): ReactElement => (
  <>
    <Typography fontWeight="normal" mb={2} variant="h6">
      We found
      <Typography color="common.blueDarker" component="span" fontWeight={700} variant="h6">
        {` ${studies.length} `}
      </Typography>
      matching trials...
    </Typography>

    {studies.map((study: ResearchStudy) => (
      <Study
        key={study.id}
        study={study}
        handleSaveStudy={handleSaveStudy(study)}
        isStudySaved={state.ids.has(study.id)}
      />
    ))}
  </>
);

export default Results;
