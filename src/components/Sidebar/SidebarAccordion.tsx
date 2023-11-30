import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';
import type { ReactElement, ReactNode, SyntheticEvent } from 'react';

export type SidebarAccordionProps = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
  disabled?: boolean;
  expanded?: boolean;
  onChange?: (event: SyntheticEvent<Element, Event>, expanded: boolean) => void;
};

const SidebarAccordion = ({ children, icon, title, ...props }: SidebarAccordionProps): ReactElement => (
  <Accordion disableGutters square {...props}>
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
