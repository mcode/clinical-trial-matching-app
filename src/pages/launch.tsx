import React, { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import smart from 'fhirclient';
import { Alert, Box, Container } from '@material-ui/core';

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

  try {
    const url = await smart(req, res).authorize({
      clientId: publicRuntimeConfig.fhirClientId,
      noRedirect: true,
      redirectUri: '/authorize',
      scope: 'launch/patient openid profile',
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
