import { Checkbox, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { ReactElement } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { FilterFormValuesType } from './types';

// ----- FIELDS ----- //

const SORTING_OPTIONS = [
  { name: 'matchLikelihood', label: 'Match Likelihood' },
  { name: 'distance', label: 'Distance' },
  { name: 'savedStatus', label: 'Saved Status' },
] as const;

export const SortingRadioGroup = ({
  field,
}: {
  field: ControllerRenderProps<FilterFormValuesType, `sortingOption`>;
}): ReactElement => (
  <RadioGroup {...field}>
    {SORTING_OPTIONS.map(({ name, label }) => (
      <FormControlLabel key={name} value={name} control={<Radio data-testid="sortingOption" />} label={label} />
    ))}
  </RadioGroup>
);

export const FilterCheckbox = ({
  field,
}: {
  field: ControllerRenderProps<
    FilterFormValuesType,
    `filterOptions.${keyof FilterFormValuesType['filterOptions']}.${keyof FilterFormValuesType['filterOptions']['recruitmentStatus']}`
  >;
}): ReactElement => {
  // Strip the final "." part off the field name
  const lastDotIdx = field.name.lastIndexOf('.');
  const testId = lastDotIdx >= 0 ? field.name.substring(0, lastDotIdx) : field.name;
  return <Checkbox {...field} checked={field.value} data-testid={testId} value="on" />;
};
