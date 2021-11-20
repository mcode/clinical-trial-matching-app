import type { ReactElement } from 'react';
import { Button } from '@mui/material';

type StudyDetailsButtonProps = {
  icon: ReactElement;
  text: string;
};

const StudyDetailsButton = ({ icon, text }: StudyDetailsButtonProps): ReactElement => (
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
  >
    {text}
  </Button>
);

export default StudyDetailsButton;
