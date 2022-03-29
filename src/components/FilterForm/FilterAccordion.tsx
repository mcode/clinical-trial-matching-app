import type { ReactElement, ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';

export type FilterAccordionProps = {
  children: ReactNode;
  defaultExpanded?: boolean;
  title: string;
  disabled: boolean;
};

const FilterAccordion = ({ children, defaultExpanded, title, disabled }: FilterAccordionProps): ReactElement => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    square
    disabled={disabled}
    sx={{ '&.MuiAccordion-root': { backgroundColor: 'unset' } }}
    className="borderless"
  >
    <AccordionSummary
      expandIcon={<ArrowDropDownIcon fontSize="large" sx={{ color: 'common.grayLight' }} />}
      aria-controls="filter-accordion-content"
      id="filter-accordion-header"
      sx={{
        color: 'common.gray',
        mt: '1px',
        '&.MuiAccordionSummary-root': { justifyContent: 'flex-start' },
        '& .MuiAccordionSummary-content': { margin: 0, flexGrow: 0 },
      }}
    >
      <Typography fontWeight="600" textTransform="uppercase">
        {title}
      </Typography>
    </AccordionSummary>

    <AccordionDetails sx={{ py: 0, pl: { xs: 2, sm: 4 }, pr: 2 }}>{children}</AccordionDetails>
  </Accordion>
);

export default FilterAccordion;
