import SearchImage from '@/assets/images/search.png'; 
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/queries/clinicalTrialPaginationQuery';
import { Search as SearchIcon } from '@mui/icons-material';
import { Box, Button, Grid, Stack, useMediaQuery, useTheme } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type { ReactElement  } from 'react';
import type { useEffect  } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import brainBiomarkerCodes from '../../../src/queries/mockData/brainBiomarkerCodes.json';
import brainCancerTypeCodes from '../../../src/queries/mockData/brainCancerTypeCodes.json';
import brainMedicationCodes from '../../../src/queries/mockData/brainMedicationCodes.json';
import breastcancerCodes from '../../../src/queries/mockData/breastcancerCodes.json';
import colonBiomarkerCodes from '../../../src/queries/mockData/colonBiomarkerCodes.json';
import colonCancerTypeCodes from '../../../src/queries/mockData/colonCancerTypeCodes.json';
import colonMedicationCodes from '../../../src/queries/mockData/colonMedicationCodes.json';
import colonRadiationCodes from '../../../src/queries/mockData/colonRadiationCodes.json';
import colonStageCodes from '../../../src/queries/mockData/colonStageCodes.json';
import colonSurgeryCodes from '../../../src/queries/mockData/colonSurgeryCodes.json';
import lungCancerSubTypeCodes from '../../../src/queries/mockData/lungCancerSubTypeCodes.json';
import lungCancerTypeCodes from '../../../src/queries/mockData/lungCancerTypeCodes.json';
import lungMedicationCodes from '../../../src/queries/mockData/lungMedicationCodes.json';
import lungRadiationCodes from '../../../src/queries/mockData/lungRadiationCodes.json';
import lungSurgeryCodes from '../../../src/queries/mockData/lungSurgeryCodes.json';
import MultipleMyelomaCancerTypeCodes from '../../../src/queries/mockData/MultipleMyelomaCancerTypeCodes.json';
import MultipleMyelomaMedicationCodes from '../../../src/queries/mockData/MultipleMyelomaMedicationCodes.json';
import prostateCancerTypeCodes from '../../../src/queries/mockData/prostateCancerTypeCodes.json';
import prostateMedicationCodes from '../../../src/queries/mockData/prostateMedicationCodes.json';
import {  
    allCancerCodes ,
    breastCancer_cancerTypeOptions ,
    breastCancer_cancerSubType,
    breastCancer_cancerSubTypeOptions,
    breastCancer_biomarkers,
    breastCancer_biomarkersOptions ,
    breastCancer_stage ,
    breastCancer_medications ,
    breastCancer_procedures ,
  
    colonCancerTypeCodes,
    //colonCancer_cancerSubType,
    colonBiomarkerCodes ,
    colonCancer_stage,
    colonMedicationCodes,
    colonCancer_procedures ,
    colonRadiationCodes,
    colonCancer_cancerTypeOptions,
    colonCancer_cancerSubTypeOptions,
    colonCancer_biomarkersOptions ,
    colonCancer_stageOptions,
    colonCancer_medicationsOptions,
    colonCancer_proceduresOptions ,
  
    lungCancerTypeCodes ,
    lungCancer_cancerTypeOptions ,
    lungCancerSubTypeCodes ,
    lungCancer_cancerSubTypeOptions , 
    lungCancer_biomarkers ,
    lungCancer_biomarkersOptions,
    lungCancer_stageOptions ,
    lungMedicationCodes ,
    lungCancer_medicationsOptions,
    lungSurgeryCodes ,
    lungCancer_proceduresOptions ,
    lungRadiationCodes, 
    lungCancer_radiationCodeOptions, 
  
     
  
  
    brainCancerTypeCodes ,
    brainCancer_cancerSubType ,
    brainCancer_cancerSubTypeOptions,
    brainBiomarkerCodes,
    brainMedicationCodes,
    brainCancer_cancerTypeOptions ,  
    brainCancer_biomarkersOptions,
    brainCancer_medicationsOptions,
  
    prostateCancerTypeCodes,
    prostateCancer_cancerTypeOptions,
    prostateCancer_stageOptions,
    prostateCancer_medications,
    prostateMedicationCodes,
    prostateCancer_biomarkersOptions,
    prostateCancer_proceduresOptions,
    prostateCancer_medicationsOptions,
   
  
    MultipleMyelomaCancerTypeCodes ,
    mmCancer_cancerTypeOptions ,
    MultipleMyelomaMedicationCodes , 
    mmCancer_medicationsOptions 
  
  } from 'src/components/SearchForm/SearchFormOptions';

export type SearchFormProps = {
  defaultValues: Partial<SearchFormValuesType>;
  fullWidth?: boolean;
};

export const formDataToSearchQuery = (data: SearchFormValuesType): SearchParameters => ({
  ...data,
  // For the cancer types, encode the JSON objects
  // Boolean check is because JSON.stringify(null) === "null" and should be omitted
  cancerType: data.cancerType ? JSON.stringify(data.cancerType) : undefined,
  cancerSubtype: data.cancerSubtype ? JSON.stringify(data.cancerSubtype) : undefined,
  matchingServices: Object.keys(data.matchingServices).filter(service => data.matchingServices[service]),
});

const SearchForm = ({ defaultValues, fullWidth }: SearchFormProps): ReactElement => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { handleSubmit, control } = useForm<SearchFormValuesType>({ defaultValues });
  const onSubmit = (data: SearchFormValuesType) =>
    router.push({
      pathname: '/results',
      query: {
        ...formDataToSearchQuery(data),
        sortingOption: 'matchLikelihood',
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
      },
    });

    //**** Russ */
    

const cancerType = watch('cancerType') 

useEffect(() => () => console.log(3), []); 
const [cancerTypes, setCancerTypes] = useState(allCancerCodes);
const [cancerCategory, setcancerCategory] = useState("");
//const [cancerTypes, setCancerTypes] = useState([]);
const [cancerSubTypes, setCancerSubTypes] = useState([]);
const [biomarkers, setBiomarkers] = useState([]);
const [stages, setStages] = useState([]);
const [medications, setMedications] = useState([]);
const [procedures, setProcedures] = useState([]);

const [selectVal, setSelectVal] = useState({
  cancerType: breastCancer_cancerTypeOptions,
  cancerSubType: "",
  biomarker: "",
  stage: "",
  medication: "",
  procedure: "",
});


const onChange = event => handleChange(cancerTypes);


const handleChange = (e) => {
  const val = e.target.value;

  console.log("***** got here "+ watch());
  console.log ("cancerTypes="+cancerTypes);
  setcancerCategory(cancerTypes["val"].entryType);
  console.log ("cancerCategory="+cancerCategory);
  switch (cancerCategory) {
     
    case "":
      //setCancerTypes(breastCancer_cancerTypeOptions);
      setCancerSubTypes([]);
      setBiomarkers([]);
      setStages([]);
      setMedications([]);
      setProcedures([]);
      break;
    case "breast":
     //setCancerTypes(breastCancer_cancerTypeOptions);
      setCancerSubTypes(breastCancer_cancerSubTypeOptions);
      //setBiomarkers(breastCancer_biomarkersOptions);
      setStages(breastCancer_stage);
      //setMedications(breastCancer_medicationsOptions);
     // setProcedures(breastCancer_proceduresOptions);
      break;
    case "lung":
      setCancerTypes(lungCancer_cancerTypeOptions);
      setCancerSubTypes(lungCancer_cancerSubTypeOptions);
      setBiomarkers(lungCancer_biomarkersOptions);
      setStages(lungCancer_stageOptions);
      setMedications(lungCancer_medicationsOptions);
      setProcedures(lungCancer_proceduresOptions);
      
      break;
    case "colon":
      setCancerTypes(colonCancer_cancerTypeOptions);
      setCancerSubTypes(colonCancer_cancerSubTypeOptions);
      setBiomarkers(colonCancer_biomarkersOptions);
      setStages(colonCancer_stageOptions);
      setMedications(colonCancer_medicationsOptions);
      setProcedures(colonCancer_proceduresOptions);
      break;
    case "brain":
      setCancerTypes(brainCancer_cancerTypeOptions);
      setCancerSubTypes(brainCancer_cancerSubTypeOptions);
      setBiomarkers(brainCancer_biomarkersOptions);
      setStages([]);
      setMedications([]);
      setProcedures([]);
      break;
    case "prostate":
      setCancerTypes(prostateCancer_cancerTypeOptions);
      setCancerSubTypes([]);
      setBiomarkers(prostateCancer_biomarkersOptions);
      setStages(prostateCancer_stageOptions);
      setMedications(prostateCancer_medicationsOptions);
      setProcedures(prostateCancer_proceduresOptions);
      break;
    case "mm":
      setCancerTypes(mmCancer_cancerTypeOptions);
      setCancerSubTypes(mmCancer_medicationsOptions);
      setBiomarkers([]);
      setStages([]);
      setMedications([]);
      setProcedures([]);
  }
};

/* end russ code*/

const handleTypeChange = (e) => {
  const { name, value } = e.target;
  setSelectVal({
    ...selectVal,
    [name]: value,
  });
};
  const renderEmptyOption = (item) => {
    return item.length > 0 ? <option value="none">Select Value</option> : "";
  };

  const renderSelectOptions = (typeList) => {
    return typeList.map((item) => (
      <option value={item} key={item}>
        {item}
      </option>
    ));
  };

  const saveData = () => {
    console.log(selectVal);
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
              defaultValue={defaultValues.cancerType}
              control={control}
              rules={{ required: true }}
              render={CancerTypeAutocomplete}
            />
          </Grid>

          <Grid item xs={8} lg={fullWidth ? 8 : 4} xl={fullWidth ? 8 : 2}>
            <Controller
              name="cancerSubtype"
              defaultValue={defaultValues.cancerSubtype}
              control={control}
              render={CancerSubtypeAutocomplete}
            />
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
