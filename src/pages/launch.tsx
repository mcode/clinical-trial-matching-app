import { Alert, Box, Container } from '@mui/material';
import smart from 'fhirclient';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import getConfig from 'next/config';
import React, { ReactElement } from 'react';

const { publicRuntimeConfig } = getConfig();

type LaunchPageProps = {
  errorMessage: string;
};

const LaunchPage = ({ errorMessage }: LaunchPageProps): ReactElement => (
  <Container>
    <Box my={4}>
      <Alert severity="error">{errorMessage}</Alert>
    </Box>
  </Container>
);

export default LaunchPage;

export const getServerSideProps = (async (context): Promise<GetServerSidePropsResult<LaunchPageProps>> => {
  const { req, res } = context;

  try {
    const url = (await smart(req, res).authorize({
      clientId: publicRuntimeConfig.fhirClientId,
      noRedirect: true,
      redirectUri: publicRuntimeConfig.fhirRedirectUri,
      scope: publicRuntimeConfig.fhirScope,
    })) as string;
    // With noRedirect: true, the result will be a URI indicating where to
    // redirect to, but the current fhirclient types don't tell TypeScript that.
    // So "cast" to a string as it will always be a string.

    return {
      redirect: {
        destination: url,
        permanent: false,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      props: {
        errorMessage: error.message,
      },
    };
  }
}) satisfies GetServerSideProps<LaunchPageProps>;
