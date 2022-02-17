import { ReactElement, useMemo, useReducer, useState, SyntheticEvent } from 'react';
import { QueryClient, useQuery } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import {
  Drawer,
  Paper,
  Stack,
  Theme,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
  SnackbarCloseReason,
  Typography,
} from '@mui/material';
import styled from '@emotion/styled';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Results, ResultsHeader, SaveStudyHandler, StudyDetailProps } from '@/components/Results';
import { SearchParameters } from 'types/search-types';
import { clinicalTrialSearchQuery } from '@/queries';
import { convertFhirPatient, convertFhirUser, Patient, User } from '@/utils/fhirConversionUtils';
import { uninitializedState, savedStudiesReducer, getSavedStudies } from '@/utils/resultsStateUtils';
import { exportSpreadsheetData, unpackStudies } from '@/utils/exportData';

type ResultsPageProps = {
  patient: Patient;
  user: User;
  searchParams: SearchParameters;
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

const ResultsPage = ({ patient, user, searchParams }: ResultsPageProps): ReactElement => {
  const [open, setOpen] = useState(true);
  const { isIdle, isLoading, data } = useQuery(
    ['clinical-trials', searchParams, patient],
    () => clinicalTrialSearchQuery(patient, user, searchParams),
    {
      enabled: typeof window !== 'undefined',
      refetchOnMount: false,
    }
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(true);
  const theme = useTheme();
  const toggleDrawer = () => setOpen(!open);
  const toggleMobileDrawer = () => setMobileOpen(!mobileOpen);
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerWidth = getDrawerWidth(isExtraSmallScreen);

  // Here, we initialize the state based on the asynchronous data coming back. When the promise hasn't resolved yet, the list of studies is empty.
  const entries = useMemo(() => data?.results as StudyDetailProps[], [data]);
  const [state, dispatch] = useReducer(savedStudiesReducer, uninitializedState);

  const alreadyHasSavedStudies = state.size !== 0;
  const handleClearSavedStudies = () => dispatch({ type: 'setInitialState' });
  const handleExportSavedStudies = (): void => {
    const savedStudies = getSavedStudies(entries, state);
    const data: Record<string, string>[] = unpackStudies(savedStudies);
    exportSpreadsheetData(data, 'clinicalTrials');
  };
  const handleSaveStudy =
    (entry: StudyDetailProps): SaveStudyHandler =>
    event => {
      // When the save button is in the accordion actions, we don't want it to expand/collapse the accordion.
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
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            variant="temporary"
            open={mobileOpen}
          >
            <Sidebar patient={patient} disabled={isIdle || isLoading} />
          </Drawer>

          <Drawer
            sx={{
              display: { xs: 'none', lg: 'block' },
              width: drawerWidth,
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                position: 'relative',
                width: drawerWidth,
              },
            }}
            variant="persistent"
            anchor="left"
            open={open}
          >
            <Sidebar patient={patient} disabled={isIdle || isLoading} />
          </Drawer>

          <SlidingStack
            alignItems="stretch"
            flexGrow={1}
            open={open}
            shrink={isExtraSmallScreen}
            sx={{ overflowY: 'auto' }}
          >
            <ResultsHeader
              isOpen={open}
              toggleDrawer={toggleDrawer}
              toggleMobileDrawer={toggleMobileDrawer}
              alreadyHasSavedStudies={alreadyHasSavedStudies}
              handleClearSavedStudies={handleClearSavedStudies}
              handleExportStudies={handleExportSavedStudies}
              showExport={!isIdle && !isLoading}
            />
            <MainContent
              elevation={0}
              sx={[
                {
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  p: 3,
                },
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
              {!isIdle && !isLoading && <Results entries={entries} state={state} handleSaveStudy={handleSaveStudy} />}
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

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res, query } = context;
  const queryClient = new QueryClient();

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
    },
  };
};
