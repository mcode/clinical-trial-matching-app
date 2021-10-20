import type { ReactElement } from 'react';
import { Button, IconButton, Stack } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

export type ResultsHeaderProps = {
  isOpen: boolean;
  toggleDrawer: () => void;
};

const ResultsHeader = ({ isOpen, toggleDrawer }: ResultsHeaderProps): ReactElement => (
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
    <IconButton onClick={toggleDrawer} sx={{ ml: 2 }}>
      {isOpen ? <ChevronLeftIcon fontSize="large" /> : <ChevronRightIcon fontSize="large" />}
    </IconButton>

    <Button sx={{ mr: 2 }}>Export All</Button>
  </Stack>
);

export default ResultsHeader;
