import type { ReactElement } from 'react';
import { Button } from '@mui/material';
import { SaveStudyHandler } from './types';

type StudyDetailsButtonProps = {
  icon: ReactElement;
  text: string;
  onClick?: SaveStudyHandler;
};

const StudyDetailsButton = ({ icon, text, ...props }: StudyDetailsButtonProps): ReactElement => (
  <Button
    startIcon={icon}
    sx={{
      fontSize: '1.1em',
      fontWeight: '600',
      mb: 2,
      minWidth: { xs: '100%', sm: '200px', xl: '400px' },
      width: '100%',
    }}
    variant="contained"
    {...props}
  >
    {text}
  </Button>
);

export default StudyDetailsButton;
