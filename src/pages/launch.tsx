import { Alert, Box, Container } from '@mui/material';
import smart from 'fhirclient';
import { GetServerSideProps } from 'next';
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

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res } = context;
  // FIXME: Next.js 13 broke something, see https://github.com/vercel/next.js/issues/57397
  // For now, remove the x-forwarded headers, they break fhirclient
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-port'];
  delete req.headers['x-forwarded-proto'];
  delete req.headers['x-forwarded-for'];

  try {
    const url = await smart(req, res).authorize({
      clientId: publicRuntimeConfig.fhirClientId,
      noRedirect: true,
      redirectUri: publicRuntimeConfig.fhirRedirectUri,
      scope: publicRuntimeConfig.fhirScope,
    });

    return {
      redirect: {
        destination: url,
        permanent: false,
      },
      props: {},
    };
  } catch (error) {
    console.error(error);

    return {
      props: {
        errorMessage: error.message,
      },
    };
  }
};
