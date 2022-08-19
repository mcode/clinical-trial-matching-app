/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useState } from 'react';
import SearchImage from '@/assets/images/search.png';
import { Search as SearchIcon } from '@mui/icons-material';
import { Box, Button, Grid, Stack, useMediaQuery, useTheme } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { Controller, useForm } from 'react-hook-form'; 
import { cancerTypeDetails, cancerTypeObj, cancerTypeOptions } from 'src/components/SearchForm/SearchFormOptions';

import { SearchParameters } from 'types/search-types';
import {
  AgeTextField,
  BiomarkersAutocomplete,
  CancerStageAutocomplete,
  CancerSubtypeAutocomplete,
  CancerTypeAutocomplete,
  ECOGScoreAutocomplete,
  KarnofskyScoreAutocomplete,
  MedicationsAutocomplete,
  MetastasisAutocomplete,
  RadiationAutocomplete,
  SurgeryAutocomplete,
  TravelDistanceTextField,
  ZipcodeTextField,
} from './FormFields';
import MatchingServices from './MatchingServices';
import { SearchFormValuesType } from './types';

export type SearchFormProps = {
  defaultValues: Partial<SearchFormValuesType>;
  fullWidth?: boolean;
};
/*
export const formDataToSearchQuery = (data: SearchFormValuesType): SearchParameters => ({
  ...data,
  // For the cancer types, encode the JSON objects
  // Boolean check is because JSON.stringify(null) === "null" and should be omitted
  cancerType: data.cancerType ? JSON.stringify(data.cancerType) : undefined,
  cancerSubtype: data.cancerSubtype ? JSON.stringify(data.cancerSubtype) : undefined,
  matchingServices: Object.keys(data.matchingServices).filter(service => data.matchingServices[service]),
});
*/
const SearchForm = ({ defaultValues, fullWidth }: SearchFormProps): ReactElement => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { handleSubmit, control, watch } = useForm<SearchFormValuesType>({ defaultValues });

  const onSubmit = (data: SearchFormValuesType) => {};

  /*router.push({
    pathname: '/results',

    query: {
      ...formDataToSearchQuery(data),
      sortingOption: 'matchLikelihood',
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    },
  });
*/
  //**** Russ */

  const cancerType = watch('cancerType');

  const [cancerTypes, setCancerTypes] = useState(cancerTypeOptions);
  const [cancerCategory, setcancerCategory] = useState('cancerTypesOptions');
  //const [cancerTypes, setCancerTypes] = useState([]);
  const [cancerSubTypes, setCancerSubTypes] = useState([]);
  const [biomarkers, setBiomarkers] = useState([]);
  const [stages, setStages] = useState([]);
  const [medications, setMedications] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [radiations, setRadiations] = useState([]);

  const [selectVal, setSelectVal] = useState({
    cancerType: cancerTypeOptions,
    cancerSubType: '',
    biomarker: '',
    stage: '',
    medication: '',
    procedure: '',
  });

  const onChange = event => handleChange(cancerTypes);

  const handleChange = e => {
    const val = e.target.value;
    setcancerCategory(cancerTypes['val'].entryType);
    //console.log('cancerCategory=' + cancerCategory);
    switch (cancerCategory) {
      case '':
        //setCancerTypes(breastCancer_cancerTypeOptions);
        setCancerSubTypes([]);
        setBiomarkers([]);
        setStages([]);
        setMedications([]);
        setProcedures([]);
        break;
      case 'breast':
        //setCancerTypes(breastCancer_cancerTypeOptions);
        setCancerSubTypes(cancerTypeDetails.brain.cancerSubtype);
        //setBiomarkers(breastCancer_biomarkersOptions);
        setStages(cancerTypeDetails.brain.stages);
        //setMedications(breastCancer_medicationsOptions);
        //setProcedures(breastCancer_proceduresOptions);
        break;
      case 'lung':
        setCancerTypes(cancerTypeDetails.lung.cancerCodes);
        setCancerSubTypes(cancerTypeDetails.lung.cancerSubtype);
        setBiomarkers(cancerTypeDetails.lung.biomarkers);
        setStages(cancerTypeDetails.lung.stages);
        setMedications(cancerTypeDetails.lung.medications);
        setProcedures(cancerTypeDetails.lung.surgeryCodes);

        break;
      case 'colon':
        setCancerTypes(cancerTypeDetails.colon.cancerCodes);
        setCancerSubTypes(cancerTypeDetails.colon.cancerSubtype);
        setBiomarkers(cancerTypeDetails.colon.biomarkers);
        setStages(cancerTypeDetails.colon.stages);
        setMedications(cancerTypeDetails.colon.medications);
        setProcedures(cancerTypeDetails.colon.surgeryCodes);
        break;
      case 'brain':
        setCancerTypes(cancerTypeDetails.brain.cancerCodes);
        setCancerSubTypes(cancerTypeDetails.brain.cancerSubtype);
        setBiomarkers(cancerTypeDetails.brain.biomarkers);
        setStages(cancerTypeDetails.breast.stages);
        setMedications([]);
        setProcedures([]);
        break;
      case 'prostate':
        setCancerTypes(cancerTypeDetails.prostate.cancerCodes);
        setCancerSubTypes(cancerTypeDetails.prostate.cancerSubtype);
        setBiomarkers(cancerTypeDetails.prostate.biomarkers);
        setStages(cancerTypeDetails.prostate.stages);
        setMedications(cancerTypeDetails.prostate.medications);
        setProcedures(cancerTypeDetails.prostate.surgeryCodes);
        break;
      case 'mm':
        setCancerTypes(cancerTypeDetails.mm.cancerCodes);
        setCancerSubTypes(cancerTypeDetails.mm.cancerSubtype);
        setStages(cancerTypeDetails.breast.stages);
        setBiomarkers([]);
        setStages([]);
        setMedications([]);
        setProcedures([]);
    }
  };

  const retrieveCancer = cancer => {
    if (cancer !== null) {
      //console.log(cancerTypeOptions[0][cancer.entryType]);
      if (cancerTypeOptions[0][cancer.entryType] !== undefined) {
        if (
          cancerTypeOptions[0][cancer.entryType].cancerSubtype !== null ||
          cancerTypeOptions[0][cancer.entryType].cancerSubtype?.length > 0
        ) {
          setCancerSubTypes(cancerTypeOptions[0][cancer.entryType].cancerSubtype?.entry);
        }
        if (
          cancerTypeOptions[0][cancer.entryType].surgeryCodes !== null ||
          cancerTypeOptions[0][cancer.entryType].surgeryCodes?.length > 0
        ) {
          setProcedures(cancerTypeOptions[0][cancer.entryType].surgeryCodes?.entry);
        }
        if (
          cancerTypeOptions[0][cancer.entryType].medications !== null ||
          cancerTypeOptions[0][cancer.entryType].medications?.length > 0
        ) {
          setMedications(cancerTypeOptions[0][cancer.entryType].medications?.entry);
        }
        if (
          cancerTypeOptions[0][cancer.entryType].stages !== null ||
          cancerTypeOptions[0][cancer.entryType].stages?.length > 0
        ) {
          setStages(cancerTypeOptions[0][cancer.entryType].stages);
        }
        if (
          cancerTypeOptions[0][cancer.entryType].radiationCodes !== null ||
          cancerTypeOptions[0][cancer.entryType].radiationCodes?.length > 0
        ) {
          setRadiations(cancerTypeOptions[0][cancer.entryType].radiationCodes?.entry);
        }
        if (
          cancerTypeOptions[0][cancer.entryType].biomarkers !== null ||
          cancerTypeOptions[0][cancer.entryType].biomarkers?.length > 0
        ) {
          setBiomarkers(cancerTypeOptions[0][cancer.entryType].biomarkers?.entry);
        }
      }
    } else {
      setCancerSubTypes([]);
      setProcedures([]);
      setMedications([]);
      setStages([]);
      setRadiations([]);
      setBiomarkers([]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box bgcolor="grey.200">
        {!(fullWidth || isSmallScreen) && (
          <Box p={{ xs: 0, md: 2 }}>
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
        )}

        <Grid columns={8} container spacing={2} px={2} py={fullWidth ? 0 : { md: 2 }} pb={{ xs: 2 }} mt={0}>
          <Grid item xs={8}>
            <MatchingServices {...{ control, fullWidth }} />
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
              defaultValue={null}
              control={control}
              rules={{ required: true }}
              render={({ field }) => <CancerTypeAutocomplete field={field} retrieveCancer={retrieveCancer} />}
            />
          </Grid>

          <Grid item xs={8} lg={fullWidth ? 8 : 4} xl={fullWidth ? 8 : 2}>
            <Controller
              name="cancerSubtype"
              defaultValue={null}
              control={control}
              render={({ field }) => <CancerSubtypeAutocomplete field={field} cancerSubTypes={cancerSubTypes} />}
            />
          </Grid>

          <Grid item xs={8} lg={fullWidth ? 8 : 4} xl={fullWidth ? 8 : 2}>
            <Controller
              name="stage"
              defaultValue={null}
              control={control}
              render={({ field }) => <CancerStageAutocomplete field={field} canceStages={stages} />}
            />
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
            <Controller
              name="biomarkers"
              defaultValue={[]}
              control={control}
              render={({ field }) => <BiomarkersAutocomplete field={field} cancerBiomarkers={biomarkers} />}
            />
          </Grid>

          <Grid item xs={8}>
            <Controller
              name="radiation"
              defaultValue={[]}
              control={control}
              render={({ field }) => <RadiationAutocomplete field={field} radiations={radiations} />}
            />
          </Grid>

          <Grid item xs={8}>
            <Controller
              name="surgery"
              defaultValue={[]}
              control={control}
              render={({ field }) => <SurgeryAutocomplete field={field} cancerSurgery={procedures} />}
            />
          </Grid>

          <Grid item xs={8}>
            <Controller
              name="medications"
              defaultValue={[]}
              control={control}
              render={({ field }) => <MedicationsAutocomplete field={field} cancerMedication={medications} />}
            />
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
