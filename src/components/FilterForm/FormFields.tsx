import { ReactElement } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Checkbox } from '@mui/material';

import { FilterFormValuesType } from './types';

// ----- FIELDS ----- //

export const SortingOptionCheckbox = ({
  field,
}: {
  field: ControllerRenderProps<FilterFormValuesType, `sortingOptions.${keyof FilterFormValuesType['sortingOptions']}`>;
}): ReactElement => <Checkbox {...field} checked={field.value} data-testid="sortingOptions" value="on" />;

export const RecruitmentStatusCheckbox = ({
  field,
}: {
  field: ControllerRenderProps<
    FilterFormValuesType,
    `filterOptions.recruitmentStatus.${keyof FilterFormValuesType['filterOptions']['recruitmentStatus']}`
  >;
}): ReactElement => (
  <Checkbox {...field} checked={field.value} data-testid="filterOptions.recruitmentStatus" value="on" />
);

export const TrialPhaseCheckbox = ({
  field,
}: {
  field: ControllerRenderProps<
    FilterFormValuesType,
    `filterOptions.trialPhase.${keyof FilterFormValuesType['filterOptions']['trialPhase']}`
  >;
}): ReactElement => <Checkbox {...field} checked={field.value} data-testid="filterOptions.trialPhase" value="on" />;

export const StudyTypeCheckbox = ({
  field,
}: {
  field: ControllerRenderProps<
    FilterFormValuesType,
    `filterOptions.studyType.${keyof FilterFormValuesType['filterOptions']['studyType']}`
  >;
}): ReactElement => <Checkbox {...field} checked={field.value} data-testid="filterOptions.studyType" value="on" />;
