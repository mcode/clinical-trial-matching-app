import type { ReactElement } from 'react';
import { Button, IconButton, Stack } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

export type ResultsHeaderProps = {
  isOpen: boolean;
  toggleDrawer: () => void;
  toggleMobileDrawer: () => void;
  alreadyHasSavedStudies: boolean;
  handleClearSavedStudies: () => void;
  handleExportStudies: () => void;
};

const ResultsHeader = ({
  isOpen,
  toggleDrawer,
  toggleMobileDrawer,
  alreadyHasSavedStudies,
  handleClearSavedStudies,
  handleExportStudies,
}: ResultsHeaderProps): ReactElement => {
  return (
    <Stack
      alignItems="center"
      bgcolor="grey.200"
      direction="row"
      flex="0 0 auto"
      height={80}
      justifyContent="space-between"
      position="sticky"
      top={0}
      zIndex={1200}
    >
      <IconButton
        onClick={toggleDrawer}
        sx={{ display: { xs: 'none', lg: 'block' }, height: '50px', ml: 2, width: '50px' }}
      >
        {isOpen ? <ChevronLeftIcon fontSize="large" /> : <ChevronRightIcon fontSize="large" />}
      </IconButton>

      <IconButton
        onClick={toggleMobileDrawer}
        sx={{ display: { xs: 'block', lg: 'none' }, height: '50px', ml: 2, width: '50px' }}
      >
        <MenuIcon fontSize="large" />
      </IconButton>

      <Stack direction="row">
        {alreadyHasSavedStudies && (
          <Button sx={{ mr: 2 }} onClick={handleClearSavedStudies}>
            Clear saved trials
          </Button>
        )}

        <Button sx={{ mr: 2 }} onClick={handleExportStudies}>
          {alreadyHasSavedStudies ? 'Export Saved' : 'Export All'}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ResultsHeader;
