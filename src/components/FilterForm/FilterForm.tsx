import { ReactElement } from 'react';
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

import { RecruitmentStatusCheckbox, SortingOptionCheckbox, StudyTypeCheckbox, TrialPhaseCheckbox } from './FormFields';
import { FilterFormValuesType } from './types';
import { FilterParameters, FullSearchParameters } from 'types/search-types';
import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import FilterAccordion from './FilterAccordion';
import { ResearchStudy } from 'fhir/r4';

export type FilterFormProps = {
  defaultValues?: Partial<FilterFormValuesType>;
  fullWidth?: boolean;
  fullSearchParams?: FullSearchParameters;
  filterOptions?: FilterOptions;
  disabled?: boolean;
};

export const formDataToFilterQuery = (data: FilterFormValuesType): FilterParameters => ({
  sortingOptions: Object.keys(data.sortingOptions).filter(option => data.sortingOptions[option]),
  recruitmentStatus: (Object.keys(data.filterOptions.recruitmentStatus) as ResearchStudy['status'][]).filter(
    option => data.filterOptions.recruitmentStatus[option]
  ),
  trialPhase: Object.keys(data.filterOptions.trialPhase).filter(option => data.filterOptions.trialPhase[option]),
  studyType: Object.keys(data.filterOptions.studyType).filter(option => data.filterOptions.studyType[option]),
});

const SORTING_OPTIONS = [
  { name: 'matchLikelihood', label: 'Match Likelihood', defaultValue: true },
  { name: 'distance', label: 'Distance', defaultValue: false },
  { name: 'savedStatus', label: 'Saved Status', defaultValue: false },
] as const;

const renderCheckboxes =
  (
    prefix: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: (props: any) => ReactElement
  ) =>
  ({
    name,
    label = name,
    count,
    defaultValue = false,
  }: {
    name: ResearchStudy['status'] | string;
    label?: string;
    count?: number;
    defaultValue?: boolean;
  }) =>
    name &&
    (count !== undefined ? (
      <Stack direction="row" justifyContent="space-between" alignItems="center" key={name}>
        <FormControlLabel
          key={name}
          control={
            <Controller name={`${prefix}.${name}`} defaultValue={defaultValue} control={control} render={render} />
          }
          label={label}
        />
        <Typography textAlign="right">{count}</Typography>
      </Stack>
    ) : (
      <FormControlLabel
        key={name}
        control={
          <Controller name={`${prefix}.${name}`} defaultValue={defaultValue} control={control} render={render} />
        }
        label={label}
      />
    ));

const FilterForm = ({
  defaultValues,
  fullWidth,
  fullSearchParams,
  filterOptions,
  disabled,
}: FilterFormProps): ReactElement => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { handleSubmit, control } = useForm<FilterFormValuesType>({ defaultValues });

  const onSubmit = (data: FilterFormValuesType) =>
    router.push({
      pathname: '/results',
      query: { ...fullSearchParams, ...formDataToFilterQuery(data as FilterFormValuesType) },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box bgcolor="grey.200">
        <Grid columns={8} container spacing={2} px={2} py={fullWidth ? 0 : { md: 2 }} pb={{ xs: 2 }} mt={0}>
          <Grid item xs={8}>
            <FilterAccordion title="Sort By" defaultExpanded disabled={disabled}>
              <FormControl component="fieldset" disabled={disabled}>
                {SORTING_OPTIONS.map(renderCheckboxes('sortingOptions', control, SortingOptionCheckbox))}
              </FormControl>
            </FilterAccordion>
          </Grid>

          {filterOptions && (
            <Grid item xs={8}>
              <FilterAccordion title="Filter By" defaultExpanded disabled={disabled}>
                <FormControl component="fieldset" disabled={disabled}>
                  {(filterOptions?.recruitmentStatus || []).length !== 0 && (
                    <FilterAccordion title="Recruitment Status" defaultExpanded disabled={disabled}>
                      {filterOptions.recruitmentStatus.map(
                        renderCheckboxes('filterOptions.recruitmentStatus', control, RecruitmentStatusCheckbox)
                      )}
                    </FilterAccordion>
                  )}
                  {(filterOptions?.trialPhase || []).length !== 0 && (
                    <FilterAccordion title="Trial Phase" defaultExpanded disabled={disabled}>
                      {filterOptions.trialPhase.map(
                        renderCheckboxes('filterOptions.trialPhase', control, TrialPhaseCheckbox)
                      )}
                    </FilterAccordion>
                  )}
                  {(filterOptions?.studyType || []).length !== 0 && (
                    <FilterAccordion title="Study Type" defaultExpanded disabled={disabled}>
                      {filterOptions.studyType.map(
                        renderCheckboxes('filterOptions.studyType', control, StudyTypeCheckbox)
                      )}
                    </FilterAccordion>
                  )}
                </FormControl>
              </FilterAccordion>
            </Grid>
          )}

          <Grid item xs={8}>
            <Button
              sx={{
                float: 'right',
                fontSize: '1.3em',
                fontWeight: '500',
                minWidth: '200px',
                width: fullWidth || isSmallScreen ? '100%' : '25%',
              }}
              type="submit"
              variant="contained"
              disabled={disabled}
            >
              <SearchIcon sx={{ paddingRight: '5px' }} /> Filter
            </Button>
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default FilterForm;
