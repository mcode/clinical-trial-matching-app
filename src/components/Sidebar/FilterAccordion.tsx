import type { ReactElement, ReactNode } from 'react';
import { AccordionDetails, Typography } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { BorderlessAccordion, BorderlessAccordionSummary } from '../Results/BorderlessAccordion';

export type FilterAccordionProps = {
  children: ReactNode;
  defaultExpanded?: boolean;
  title: string;
  disabled: boolean;
};

const FilterAccordion = ({ children, defaultExpanded, title, disabled }: FilterAccordionProps): ReactElement => (
  <BorderlessAccordion
    defaultExpanded={defaultExpanded}
    disableGutters
    square
    disabled={disabled}
    sx={{ '& .MuiAccordionSummary-root': { justifyContent: 'flex-start' } }}
  >
    <BorderlessAccordionSummary
      expandIcon={<ArrowDropDownIcon fontSize="large" sx={{ color: 'common.grayLight' }} />}
      aria-controls="filter-accordion-content"
      id="filter-accordion-header"
      sx={{
        color: 'common.gray',
        mt: '1px',
        '&.MuiAccordionSummary-root': { minHeight: 'unset' },
        '& .MuiAccordionSummary-content': { flexGrow: 0 },
      }}
    >
      <Typography fontWeight="600" textTransform="uppercase">
        {title}
      </Typography>
    </BorderlessAccordionSummary>

    <AccordionDetails sx={{ py: 0, pl: { xs: 2, sm: 4 }, pr: 2 }}>{children}</AccordionDetails>
  </BorderlessAccordion>
);

export default FilterAccordion;
