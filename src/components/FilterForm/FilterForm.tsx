import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { Search as SearchIcon } from '@mui/icons-material';
import { Box, Button, FormControl, Grid, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FilterParameters, FullSearchParameters, SortingParameters } from 'types/search-types';
import FilterAccordion from './FilterAccordion';
import { SortingRadioGroup } from './FormFields';
import { FilterFormValuesType } from './types';

export type FilterFormProps = {
  defaultValues: Partial<FilterFormValuesType>;
  blankValues: Partial<FilterFormValuesType>;
  fullWidth?: boolean;
  fullSearchParams?: FullSearchParameters;
  filterOptions: FilterOptions;
  disabled?: boolean;
};

export const formDataToFilterQuery = ({
  sortingOption,
  filterOptions: { recruitmentStatus, trialPhase, studyType },
}: FilterFormValuesType): FilterParameters & SortingParameters => ({
  sortingOption,
  recruitmentStatus: Object.keys(recruitmentStatus).filter(option => recruitmentStatus[option]),
  trialPhase: Object.keys(trialPhase).filter(option => trialPhase[option]),
  studyType: Object.keys(studyType).filter(option => studyType[option]),
});

// Change defaultValues into a string query
export const defaultValuesToQuery = (defaultValues: Partial<FilterFormValuesType>) => {
  const originalValues = {};

  Object.keys(defaultValues).forEach(key => {
    originalValues['pre_' + key] = defaultValues[key];
  });

  return originalValues;
};

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

  const originalValues = defaultValuesToQuery(defaultValues);

  const onSubmit = (data: FilterFormValuesType) =>
    router.push({
      pathname: '/results',
      query: { ...fullSearchParams, ...formDataToFilterQuery(data as FilterFormValuesType), ...originalValues },
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

            <FilterAccordion title="Sort By" disabled={disabled}>
              <FormControl disabled={disabled}>
                <Controller name="sortingOption" control={control} render={SortingRadioGroup} />
              </FormControl>
            </FilterAccordion>
          </Grid>

          {filterOptions && (
            <Grid item xs={8}>
              <FilterAccordion title="Filter By" disabled={disabled}>
                <FormControl component="fieldset" disabled={disabled}>
                  {Object.keys(filterOptions).map((key: keyof FilterOptions) => (
                    <FilterAccordion
                      key={key}
                      title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      disabled={disabled}
                      options={filterOptions[key]}
                      control={control}
                      controllerName={key}
                    />
                  ))}
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
