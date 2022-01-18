import type { ReactElement, ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

export type SidebarAccordionProps = {
  children: ReactNode;
  defaultExpanded?: boolean;
  icon: ReactNode;
  title: string;
  disabled: boolean;
};

const SidebarAccordion = ({
  children,
  defaultExpanded,
  icon,
  title,
  disabled,
}: SidebarAccordionProps): ReactElement => (
  <Accordion defaultExpanded={defaultExpanded} disableGutters square disabled={disabled}>
    <AccordionSummary
      expandIcon={<ExpandMoreIcon fontSize="large" sx={{ color: 'common.white' }} />}
      aria-controls="sidebar-accordion-content"
      id="sidebar-accordion-header"
      sx={{
        backgroundColor: 'common.gray',
        color: 'common.white',
        mt: '1px',
      }}
    >
      <Typography sx={{ alignItems: 'center', display: 'flex', fontWeight: 'normal' }} variant="h6">
        <Stack alignItems="center" ml={1} mr={3}>
          {icon}
        </Stack>

        {title}
      </Typography>
    </AccordionSummary>

    <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
  </Accordion>
);

export default SidebarAccordion;
