import type { ReactElement } from 'react';
import { Button, IconButton, Stack } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { SavedStudiesState } from './types';

export type ResultsHeaderProps = {
  isOpen: boolean;
  toggleDrawer: () => void;
  toggleMobileDrawer: () => void;
  state: SavedStudiesState;
  handleClearSavedStudies: () => void;
};

const ResultsHeader = ({
  isOpen,
  toggleDrawer,
  toggleMobileDrawer,
  state,
  handleClearSavedStudies,
}: ResultsHeaderProps): ReactElement => {
  const alreadyHasSavedStudies = state.ids.size !== 0;
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

        <Button sx={{ mr: 2 }}>{alreadyHasSavedStudies ? 'Export Saved' : 'Export All'}</Button>
      </Stack>
    </Stack>
  );
};

export default ResultsHeader;
