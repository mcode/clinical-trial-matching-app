import { ReactElement, useState } from 'react';
import { QueryClient, useQuery } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import smart from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { Drawer, Paper, Stack, Theme, useTheme, useMediaQuery } from '@mui/material';
import styled from '@emotion/styled';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Results, ResultsHeader } from '@/components/Results';
import mockSearchResults from '@/__mocks__/results.json';
import { clinicalTrialSearchQuery } from '@/queries';
import { convertFhirPatient, convertFhirUser, Patient, User } from '@/utils/fhirConversionUtils';

type ResultsPageProps = {
  patient: Patient;
  user: User;
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

const ResultsPage = ({ patient, user }: ResultsPageProps): ReactElement => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data } = useQuery(['clinical-trials'], () => clinicalTrialSearchQuery(), { refetchOnMount: false });
  const theme = useTheme();
  const toggleDrawer = () => setOpen(!open);
  const toggleMobileDrawer = () => setMobileOpen(!mobileOpen);
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerWidth = getDrawerWidth(isExtraSmallScreen);

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
            <Sidebar patient={patient} />
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
            <Sidebar patient={patient} />
          </Drawer>

          <SlidingStack
            alignItems="stretch"
            flexGrow={1}
            open={open}
            shrink={isExtraSmallScreen}
            sx={{ overflowY: 'auto' }}
          >
            <ResultsHeader isOpen={open} toggleDrawer={toggleDrawer} toggleMobileDrawer={toggleMobileDrawer} />

            <MainContent elevation={0} sx={{ flex: '1 1 auto', overflowY: 'auto', p: 3 }} square>
              <Results data={data} />
            </MainContent>
          </SlidingStack>
        </Stack>
      </Stack>
    </>
  );
};

export default ResultsPage;

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res } = context;
  const queryClient = new QueryClient();

  let fhirClient: Client;
  try {
    fhirClient = await smart(req, res).ready();
  } catch (e) {
    return { props: {}, redirect: { destination: '/launch', permanent: false } };
  }

  const [fhirPatient, fhirUser] = await Promise.all([fhirClient.patient.read(), fhirClient.user.read()]);
  await queryClient.prefetchQuery(['clinical-trials'], () => mockSearchResults);

  return {
    props: {
      patient: convertFhirPatient(fhirPatient),
      user: convertFhirUser(fhirUser),
      dehydratedState: dehydrate(queryClient),
    },
  };
};
