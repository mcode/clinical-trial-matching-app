import type { ReactElement } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Box, Button, Grid, Stack, useMediaQuery, useTheme } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

import {
  AgeTextField,
  BiomarkersAutocomplete,
  CancerStageAutocomplete,
  CancerSubtypeTextField,
  CancerTypeTextField,
  ECOGScoreAutocomplete,
  KarnofskyScoreAutocomplete,
  MedicationsAutocomplete,
  MetastasisAutocomplete,
  RadiationAutocomplete,
  SurgeryAutocomplete,
  TravelDistanceTextField,
  ZipcodeTextField,
} from './FormFields';
import SearchImage from '@/assets/images/search.png';
import MatchingServices from './MatchingServices';
import { SearchFormValuesType } from './types';

export type SearchFormProps = {
  defaultValues?: Partial<SearchFormValuesType>;
  fullWidth?: boolean;
};

const formDataToSearchQuery = (data: SearchFormValuesType) => ({
  ...data,
  matchingServices: Object.keys(data.matchingServices).filter(service => data.matchingServices[service]),
});

const SearchForm = ({ defaultValues, fullWidth }: SearchFormProps): ReactElement => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { handleSubmit, control } = useForm<SearchFormValuesType>({ defaultValues });
  const onSubmit = data => router.push({ pathname: '/results', query: formDataToSearchQuery(data) });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box bgcolor="grey.200">
        <Box p={{ xs: 0, md: 2 }} display={fullWidth ? 'none' : { xs: 'none', md: 'block' }}>
          <Stack alignItems="center" direction={{ xs: 'column', lg: 'row' }} justifyContent="center">
            <Box>
              <Image
                src={SearchImage}
                alt="Clinical Trial Finder Search"
                layout="fixed"
                width={400}
                height={190}
                priority
              />
            </Box>

            <Box ml={{ md: 0, lg: 10 }} textAlign={{ xs: 'center', lg: 'left' }}>
              <Box fontSize={{ xs: 30, lg: 38, xl: 63 }} fontWeight={300}>
                Let's find some clinical trials
              </Box>

              <Box color="grey.600" fontSize={{ xs: 20, lg: 25, xl: 28 }} fontWeight={300}>
                Search with data populated from your record, or change to find matching trials
              </Box>
            </Box>
          </Stack>
        </Box>

        <Grid columns={8} container spacing={2} px={2} py={fullWidth ? 0 : { md: 2 }} pb={{ xs: 2 }} mt={0}>
          <Grid item xs={8}>
            <MatchingServices control={control} fullWidth={fullWidth} />
          </Grid>

          <Grid item xs={8} lg={fullWidth ? 8 : 4} xl={fullWidth ? 8 : 2}>
            <Controller
              name="zipcode"
              defaultValue=""
              control={control}
              rules={{ required: true }}
              render={ZipcodeTextField}
            />
          </Grid>

          <Grid item xs={8} lg={fullWidth ? 8 : 4} xl={fullWidth ? 8 : 2}>
            <Controller name="travelDistance" defaultValue="" control={control} render={TravelDistanceTextField} />
          </Grid>

          <Grid item xs={8} lg={fullWidth ? 8 : 4} xl={fullWidth ? 8 : 2}>
            <Controller name="age" defaultValue="" control={control} render={AgeTextField} />
          </Grid>

          <Grid item xs={8} lg={fullWidth ? 8 : 4} xl={fullWidth ? 8 : 2}>
            <Controller
              name="cancerType"
              defaultValue=""
              control={control}
              rules={{ required: true }}
              render={CancerTypeTextField}
            />
          </Grid>

          <Grid item xs={8} lg={fullWidth ? 8 : 4} xl={fullWidth ? 8 : 2}>
            <Controller name="cancerSubtype" defaultValue="" control={control} render={CancerSubtypeTextField} />
          </Grid>

          <Grid item xs={8} lg={fullWidth ? 8 : 4} xl={fullWidth ? 8 : 2}>
            <Controller name="stage" defaultValue={null} control={control} render={CancerStageAutocomplete} />
          </Grid>

          <Grid item xs={8} xl={fullWidth ? 8 : 2}>
            <Controller name="ecogScore" defaultValue={null} control={control} render={ECOGScoreAutocomplete} />
          </Grid>

          <Grid item xs={8} xl={fullWidth ? 8 : 2}>
            <Controller
              name="karnofskyScore"
              defaultValue={null}
              control={control}
              render={KarnofskyScoreAutocomplete}
            />
          </Grid>

          <Grid item xs={8}>
            <Controller name="metastasis" defaultValue={[]} control={control} render={MetastasisAutocomplete} />
          </Grid>

          <Grid item xs={8}>
            <Controller name="biomarkers" defaultValue={[]} control={control} render={BiomarkersAutocomplete} />
          </Grid>

          <Grid item xs={8}>
            <Controller name="radiation" defaultValue={[]} control={control} render={RadiationAutocomplete} />
          </Grid>

          <Grid item xs={8}>
            <Controller name="surgery" defaultValue={[]} control={control} render={SurgeryAutocomplete} />
          </Grid>

          <Grid item xs={8}>
            <Controller name="medications" defaultValue={[]} control={control} render={MedicationsAutocomplete} />
          </Grid>

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
            >
              <SearchIcon sx={{ paddingRight: '5px' }} /> Search
            </Button>
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default SearchForm;
