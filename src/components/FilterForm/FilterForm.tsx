import { ReactElement } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { FilterParameters, FullSearchParameters, SortingParameters } from 'types/search-types';
import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import FilterAccordion from './FilterAccordion';

export type FilterFormProps = {
  defaultValues: Partial<FilterFormValuesType>;
  blankValues: Partial<FilterFormValuesType>;
  fullWidth?: boolean;
  fullSearchParams?: FullSearchParameters;
  filterOptions: FilterOptions;
  disabled?: boolean;
};

export const formDataToFilterQuery = ({
  sortingOptions,
  filterOptions: { recruitmentStatus, trialPhase, studyType },
}: FilterFormValuesType): FilterParameters & SortingParameters => ({
  sortingOptions: Object.keys(sortingOptions).filter(option => sortingOptions[option]),
  recruitmentStatus: Object.keys(recruitmentStatus).filter(option => recruitmentStatus[option]),
  trialPhase: Object.keys(trialPhase).filter(option => trialPhase[option]),
  studyType: Object.keys(studyType).filter(option => studyType[option]),
});

const SORTING_OPTIONS = [
  { name: 'matchLikelihood', label: 'Match Likelihood', defaultValue: true },
  { name: 'distance', label: 'Distance', defaultValue: false },
  { name: 'savedStatus', label: 'Saved Status', defaultValue: false },
] as const;

const FilterForm = ({
  defaultValues,
  blankValues,
  fullWidth,
  fullSearchParams,
  filterOptions,
  disabled,
}: FilterFormProps): ReactElement => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { handleSubmit, control, reset } = useForm<FilterFormValuesType>({ defaultValues });

  const onSubmit = (data: FilterFormValuesType) =>
    router.push({
      pathname: '/results',
      query: { ...fullSearchParams, ...formDataToFilterQuery(data as FilterFormValuesType) },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box bgcolor="grey.200">
        <Grid columns={8} container spacing={2} px={2} py={fullWidth ? 0 : { md: 2 }} pb={{ xs: 2 }} mt={0}>
          <Grid
            item
            xs={8}
            sx={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' }}
            display="flex"
          >
            <Button onClick={() => reset(blankValues)} disabled={disabled} variant="text">
              Clear all
            </Button>

            <FilterAccordion title="Sort By" defaultExpanded disabled={disabled}>
              <FormControl component="fieldset" disabled={disabled}>
                {SORTING_OPTIONS.map(({ name, label, defaultValue }) => (
                  <FormControlLabel
                    key={name}
                    control={
                      <Controller
                        name={`sortingOptions.${name}`}
                        defaultValue={defaultValue}
                        control={control}
                        render={SortingOptionCheckbox}
                      />
                    }
                    label={label}
                  />
                ))}
              </FormControl>
            </FilterAccordion>
          </Grid>

          {filterOptions && (
            <Grid item xs={8}>
              <FilterAccordion title="Filter By" defaultExpanded disabled={disabled}>
                <FormControl component="fieldset" disabled={disabled}>
                  {(filterOptions?.recruitmentStatus || []).length !== 0 && (
                    <FilterAccordion title="Recruitment Status" defaultExpanded disabled={disabled}>
                      {filterOptions.recruitmentStatus.map(({ name, label, count }) => (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" key={`${name}`}>
                          <FormControlLabel
                            control={
                              <Controller
                                name={`filterOptions.recruitmentStatus.${name}`}
                                defaultValue={false}
                                control={control}
                                render={RecruitmentStatusCheckbox}
                              />
                            }
                            label={label}
                          />
                          <Typography textAlign="right">{count}</Typography>
                        </Stack>
                      ))}
                    </FilterAccordion>
                  )}
                  {(filterOptions?.trialPhase || []).length !== 0 && (
                    <FilterAccordion title="Trial Phase" defaultExpanded disabled={disabled}>
                      {filterOptions.trialPhase.map(({ name, label = name, count }) => (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" key={`${name}`}>
                          <FormControlLabel
                            control={
                              <Controller
                                name={`filterOptions.trialPhase.${name}`}
                                defaultValue={false}
                                control={control}
                                render={TrialPhaseCheckbox}
                              />
                            }
                            label={label}
                          />
                          <Typography textAlign="right">{count}</Typography>
                        </Stack>
                      ))}
                    </FilterAccordion>
                  )}
                  {(filterOptions?.studyType || []).length !== 0 && (
                    <FilterAccordion title="Study Type" defaultExpanded disabled={disabled}>
                      {filterOptions.studyType.map(({ name, label = name, count }) => (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" key={`${name}`}>
                          <FormControlLabel
                            control={
                              <Controller
                                name={`filterOptions.studyType.${name}`}
                                defaultValue={false}
                                control={control}
                                render={StudyTypeCheckbox}
                              />
                            }
                            label={label}
                          />
                          <Typography textAlign="right">{count}</Typography>
                        </Stack>
                      ))}
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
