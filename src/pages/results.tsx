import Header from '@/components/Header';
import { Results, ResultsHeader, SaveStudyHandler, StudyDetailProps } from '@/components/Results';
import Sidebar from '@/components/Sidebar';
import { ensureArray } from '@/components/Sidebar/Sidebar';
import { UserIdContext } from '@/components/UserIdContext';
import { clinicalTrialSearchQuery } from '@/queries';
import clinicalTrialDistanceQuery from '@/queries/clinicalTrialDistanceQuery';
import clinicalTrialFilterQuery from '@/queries/clinicalTrialFilterQuery';
import clinicalTrialPaginationQuery from '@/queries/clinicalTrialPaginationQuery';
import {
  convertCodesToBiomarkers,
  convertCodesToMedications,
  convertCodesToMetastases,
  convertCodesToRadiations,
  convertCodesToSurgeries,
} from '@/utils/encodeODPE';
import { exportCsvStringData } from '@/utils/exportData';
import { CodedValueType, convertFhirPatient, convertFhirUser, Patient, User } from '@/utils/fhirConversionUtils';
import { savedStudiesReducer, uninitializedState } from '@/utils/resultsStateUtils';
import styled from '@emotion/styled';
import {
  Alert,
  CircularProgress,
  Drawer,
  Paper,
  Snackbar,
  SnackbarCloseReason,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Head from 'next/head';
import { ParsedUrlQuery } from 'querystring';
import { ReactElement, SyntheticEvent, useMemo, useReducer, useRef, useState } from 'react';
import { QueryClient, useQuery } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import {
  FilterParameters,
  FullSearchParameters,
  PaginationParameters,
  SearchParameters,
  SortingParameters,
} from 'types/search-types';
import { GetConfig } from 'types/config';

const {
  publicRuntimeConfig: { sendLocationData, fhirlessPatient },
} = getConfig() as GetConfig;

type ResultsPageProps = {
  patient: Patient;
  user: User;
  searchParams: FullSearchParameters;
  userId: string;
};

const openTransition = (theme: Theme) =>
  theme.transitions.create('margin', {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  });

const leaveTransition = (theme: Theme) =>
  theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  });

const getDrawerWidth = (shrink: boolean) => {
  return shrink ? 250 : 400;
};

type SlidingStackProps = {
  theme?: Theme;
  open: boolean;
  shrink: boolean;
};

const SlidingStack = styled(Stack, {
  shouldForwardProp: prop => !(prop === 'open' || prop === 'shrink'),
})<SlidingStackProps>`
  ${({ theme, open, shrink }: SlidingStackProps) => `
    transition: ${leaveTransition(theme)};
    margin-left: 0;

    ${theme.breakpoints.up('lg')} {
      margin-left: -${getDrawerWidth(shrink)}px;

      ${open ? `transition: ${openTransition(theme)}; margin-left: 0;` : ''};
    }
  `};
`;

const MainContent = styled(Paper)`
  overflow-y: auto;
  position: relative;
  flex: 1 0 auto;
`;

const getParameters = <T extends Partial<FullSearchParameters>>(keys: (keyof T)[]) => {
  return function (fullSearchParams: FullSearchParameters) {
    return keys.reduce((obj, key) => {
      obj[key] = fullSearchParams[key as string];
      return obj;
    }, {} as T);
  };
};

// Don't want to trigger search query if only distance-filter parameters change
const getSearchParams = getParameters<SearchParameters>([
  'matchingServices',
  'age',
  'cancerType',
  'cancerSubtype',
  'metastasis',
  'stage',
  'ecogScore',
  'karnofskyScore',
  'biomarkers',
  'medications',
  'radiation',
  'surgery',
  // If we're not sending location data, we get all trials back
  ...(sendLocationData ? ['zipcode' as keyof SearchParameters, 'travelDistance' as keyof SearchParameters] : []),
]);

// Don't want to trigger distance-filter query if only search parameters change
const getDistanceParams = getParameters<SearchParameters>(['zipcode', 'travelDistance']);

// Don't want to trigger filter query if only pagination parameters change
const getFilterParams = getParameters<FilterParameters & SortingParameters>([
  'recruitmentStatus',
  'trialPhase',
  'studyType',
  'sortingOption',
  'savedStudies',
]);

const getPaginationParams = getParameters<PaginationParameters>(['page', 'pageSize']);

const ResultsPage = ({ patient, user, searchParams, userId: initialUserId }: ResultsPageProps): ReactElement => {
  const [open, setOpen] = useState(true);

  const { data: searchData } = useQuery(
    ['clinical-trials', getSearchParams(searchParams), patient],
    () => clinicalTrialSearchQuery(patient, user, searchParams),
    {
      enabled: typeof window !== 'undefined',
      refetchOnMount: false,
    }
  );

  const { data: distanceFilteredData } = useQuery(
    ['clinical-trials', searchData, getDistanceParams(searchParams)],
    () => clinicalTrialDistanceQuery(searchData),
    {
      enabled: !!searchData && typeof window !== 'undefined',
      refetchOnMount: false,
    }
  );

  const { data: filteredData } = useQuery(
    ['clinical-trials', distanceFilteredData, getFilterParams(searchParams)],
    () => clinicalTrialFilterQuery(distanceFilteredData, searchParams),
    {
      enabled: !!distanceFilteredData && typeof window !== 'undefined',
      refetchOnMount: false,
    }
  );

  const { isIdle, isLoading, data } = useQuery(
    ['clinical-trials', filteredData, getPaginationParams(searchParams)],
    () => clinicalTrialPaginationQuery(filteredData, searchParams),
    {
      enabled: !!filteredData && typeof window !== 'undefined',
      refetchOnMount: false,
    }
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const theme = useTheme();
  const toggleDrawer = () => setOpen(!open);
  const toggleMobileDrawer = () => setMobileOpen(!mobileOpen);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerWidth = getDrawerWidth(isSmallScreen);

  // Here, we initialize the state based on the asynchronous data coming back. When the promise hasn't resolved yet, the list of studies is empty.
  const filterOptions = useMemo(() => data?.filterOptions, [data]);
  const [state, dispatch] = useReducer(
    savedStudiesReducer,
    (searchParams.savedStudies && new Set<string>(ensureArray(searchParams.savedStudies))) || uninitializedState
  );

  const hasSavedStudies = state.size !== 0;
  const handleClearSavedStudies = () => dispatch({ type: 'setInitialState' });

  /** TODO: Saved studies only works on current page. For now do all filteredData instead. */
  const handleExportCsvStudies = (): string => {
    // const savedStudies = getSavedStudies(data.results, state);
    return exportCsvStringData(searchParams, filteredData.results);
  };

  const handleSaveStudy =
    (entry: StudyDetailProps): SaveStudyHandler =>
    event => {
      // We don't want to expand/collapse the accordion when triggering the save button.
      event.stopPropagation();
      dispatch({ type: 'toggleSave', value: entry });
    };
  const handleClose = (event: SyntheticEvent<Element, Event>, reason?: SnackbarCloseReason) => {
    // Don't close if we're just clicking "off" of the element
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  const scrollableParent = useRef<HTMLDivElement>(null);

  return (
    <>
      <Head>
        <title>Results | Clinical Trial Finder</title>
      </Head>

      <Stack minHeight="100vh" maxHeight="100vh" sx={{ overflowY: 'auto' }}>
        <Header userName={user?.name} />

        <Stack alignItems="stretch" direction={{ xs: 'column', lg: 'row' }} flex="1 1 auto" sx={{ overflowY: 'auto' }}>
          <Drawer
            onClose={toggleMobileDrawer}
            ModalProps={{ keepMounted: true }} // for better open performance on mobile
            sx={{
              display: { xs: 'block', lg: 'none' },
              width: drawerWidth,
              '& .MuiDrawer-paper': { width: drawerWidth },
            }}
            variant="temporary"
            open={mobileOpen}
          >
            <UserIdContext.Provider value={userId}>
              <Sidebar
                patient={patient}
                disabled={isIdle || isLoading}
                savedStudies={state}
                filterOptions={filterOptions}
                setUserId={setUserId}
                query={searchParams}
              />
            </UserIdContext.Provider>
          </Drawer>

          <Drawer
            sx={{
              display: { xs: 'none', lg: 'block' },
              width: drawerWidth,
              '& .MuiDrawer-paper': { position: 'relative', width: drawerWidth },
            }}
            variant="persistent"
            anchor="left"
            open={open}
          >
            <Sidebar
              patient={patient}
              disabled={isIdle || isLoading}
              savedStudies={state}
              filterOptions={filterOptions}
              setUserId={setUserId}
              query={searchParams}
            />
          </Drawer>

          <SlidingStack
            ref={scrollableParent}
            alignItems="stretch"
            flexGrow={1}
            open={open}
            shrink={isSmallScreen}
            sx={{ overflowY: 'auto' }}
          >
            <ResultsHeader
              isOpen={open}
              {...{
                toggleMobileDrawer,
                hasSavedStudies,
                handleClearSavedStudies,
                handleExportCsvStudies,
                toggleDrawer,
              }}
              showExport={!isIdle && !isLoading}
            />
            <MainContent
              elevation={0}
              sx={[
                { flex: '1 1 auto', overflowY: 'auto', p: 3 },
                (isIdle || isLoading) && { display: 'flex', justifyContent: 'center', alignItems: 'center' },
              ]}
              square
            >
              {(isIdle || isLoading) && (
                <Stack alignItems="center" justifyContent="center" height="100%">
                  <CircularProgress size={drawerWidth / 4} />
                  <Typography variant="h4" marginTop={3}>
                    Loading trials...
                  </Typography>
                </Stack>
              )}
              {!isIdle && !isLoading && <Results response={data} {...{ state, handleSaveStudy, scrollableParent }} />}
              {!isIdle && !isLoading && data?.errors?.length > 0 && (
                <Snackbar
                  open={alertOpen}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  onClose={handleClose}
                >
                  {/* Because you can only show one snackbar at a time, we'll display all of the services that errored out. */}
                  <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    There was an error with the following service(s):{' '}
                    {data.errors.map(item => item.serviceName).join(', ')}
                  </Alert>
                </Snackbar>
              )}
            </MainContent>
          </SlidingStack>
        </Stack>
      </Stack>
    </>
  );
};

export default ResultsPage;

const rehydrateCodes = (
  query: ParsedUrlQuery,
  key: string,
  converter: (values: string[]) => CodedValueType[]
): void => {
  const codeJson = query[key];
  if (typeof codeJson === 'string') {
    try {
      const codes = JSON.parse(codeJson);
      if (Array.isArray(codes)) {
        query[key] = JSON.stringify(converter(codes));
      }
    } catch (ex) {
      console.log('Cannot recreate values for %s: %o', key, ex);
    }
  }
};

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res, query } = context;
  // FIXME: Next.js 13 broke something, see https://github.com/vercel/next.js/issues/57397
  // For now, remove the x-forwarded headers, they break fhirclient
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-port'];
  delete req.headers['x-forwarded-proto'];
  delete req.headers['x-forwarded-for'];
  const queryClient = new QueryClient();
  const userId = Array.isArray(query['userid']) ? query['userid'].join('') : query['userid'] ?? null;

  // "Rehydrate" codes
  rehydrateCodes(query, 'metastasis', convertCodesToMetastases);
  rehydrateCodes(query, 'biomarkers', convertCodesToBiomarkers);
  rehydrateCodes(query, 'medications', convertCodesToMedications);
  rehydrateCodes(query, 'radiation', convertCodesToRadiations);
  rehydrateCodes(query, 'surgery', convertCodesToSurgeries);

  if (query['fhirless'] !== undefined) {
    // In this case, the results are "fhirless" and we return a default set of properties
    return {
      props: {
        // Patient data is currently configured in .env
        patient: fhirlessPatient,
        searchParams: query,
        dehydratedState: dehydrate(queryClient),
        userId: userId,
      },
    };
  }

  let fhirClient: Client;
  try {
    fhirClient = await smart(req, res).ready();
  } catch (e) {
    return { props: {}, redirect: { destination: '/launch', permanent: false } };
  }

  const [fhirPatient, fhirUser] = await Promise.all([fhirClient.patient.read(), fhirClient.user.read()]);

  return {
    props: {
      patient: convertFhirPatient(fhirPatient),
      user: convertFhirUser(fhirUser),
      searchParams: query,
      dehydratedState: dehydrate(queryClient),
      userId: userId,
    },
  };
};
