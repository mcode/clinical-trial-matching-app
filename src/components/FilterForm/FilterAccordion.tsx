import { FilterOption, FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, FormControlLabel, Stack, Typography } from '@mui/material';
import type { ReactElement, ReactNode } from 'react';
import { Control, Controller } from 'react-hook-form';
import { FilterCheckbox } from './FormFields';
import { FilterFormValuesType } from './types';

export type FilterAccordionProps = {
  children?: ReactNode;
  title: string;
  disabled: boolean;
  options?: FilterOption[];
  control?: Control<FilterFormValuesType>;
  controllerName?: keyof FilterOptions;
};

const renderFilterCheckboxes = (
  options: FilterOption[],
  controllerName: keyof FilterFormValuesType['filterOptions'],
  control: Control<FilterFormValuesType>
): ReactNode => {
  return options.map(({ name, label = name, count }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" key={name}>
      <FormControlLabel
        key={name}
        control={
          <Controller
            name={`filterOptions.${controllerName}.${name}`}
            defaultValue={false}
            control={control}
            render={FilterCheckbox}
          />
        }
        label={label}
        sx={{ px: { xs: 0, sm: 2 } }}
      />
      <Typography textAlign="right">{count}</Typography>
    </Stack>
  ));
};

const FilterAccordion = ({
  children,
  title,
  disabled,
  options,
  control,
  controllerName,
}: FilterAccordionProps): ReactElement => (
  <Accordion
    defaultExpanded
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
        px: { xs: 0, sm: 'unset' },
      }}
    >
      <Typography fontWeight="600" textTransform="uppercase">
        {title}
      </Typography>
    </AccordionSummary>

    <AccordionDetails sx={{ py: 0, px: { xs: 0, sm: 2 } }}>
      {(options || []).length !== 0 && control && controllerName
        ? renderFilterCheckboxes(options, controllerName, control)
        : children}
    </AccordionDetails>
  </Accordion>
);

export default FilterAccordion;
