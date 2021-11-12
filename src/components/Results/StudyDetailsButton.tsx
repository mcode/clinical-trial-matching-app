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
      borderRadius: '0',
      color: 'common.white',
      fontSize: '1.1em',
      fontWeight: '600',
      height: '50px',
      mb: 2,
      minWidth: { xs: '200px', xl: '400px' },
      width: '100%',
    }}
    variant="contained"
  >
    <>{text}</>
  </Button>
);

export default StudyDetailsButton;
