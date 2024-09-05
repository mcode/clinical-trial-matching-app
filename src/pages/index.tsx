import styled from '@emotion/styled';
import { CircularProgress, Paper, Stack, Typography } from '@mui/material';
import smart from 'fhirclient';
import { GetServerSideProps } from 'next';
import { ReactElement, useEffect, useState } from 'react';

const MainContent = styled(Paper)`
  overflow-y: auto;
  position: relative;
  flex: 1 0 auto;
`;

const IndexPage = (): ReactElement => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (loading) {
      setLoading(false);
      // Forward to the next page
      window.location.assign('/search');
    }
  }, [loading]);
  return (
    <Stack minHeight="100vh" maxHeight="100vh" sx={{ overflowY: 'auto' }}>
      <MainContent elevation={0} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} square>
        <Stack alignItems="center" justifyContent="center" height="100%">
          <CircularProgress size={100} />
          <Typography variant="h4" marginTop={3}>
            Please wait, loading patient data...
          </Typography>
        </Stack>
      </MainContent>
    </Stack>
  );
};

export default IndexPage;

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res } = context;

  try {
    await smart(req, res).ready();

    return { props: {} };
  } catch (e) {
    console.error('Error starting SMART on FHIR');
    console.error(e);
    return { props: {}, redirect: { destination: '/launch', permanent: false } };
  }
};
