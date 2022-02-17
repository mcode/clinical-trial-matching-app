import type { ReactElement } from 'react';
import { Button } from '@mui/material';
import { SaveStudyHandler } from './types';

type StudyDetailsButtonProps = {
  icon: ReactElement;
  text: string;
  onClick?: SaveStudyHandler;
  target?: string;
  href?: string;
};

const StudyDetailsButton = ({ icon, text, ...props }: StudyDetailsButtonProps): ReactElement => (
  <Button
    startIcon={icon}
    sx={{
      fontSize: '1.1em',
      fontWeight: '600',
      mb: 2,
      minWidth: { xs: '100%', sm: '200px' },
      width: '100%',
      flex: 'none',
    }}
    variant="contained"
    {...props}
  >
    {text}
  </Button>
);

export default StudyDetailsButton;
