import { Alert, Box, Container } from '@mui/material';
import smart from 'fhirclient';
import { GetServerSideProps } from 'next';
import React, { ReactElement } from 'react';

type AuthorizePageProps = {
  errorMessage: string;
};

const AuthorizePage = ({ errorMessage }: AuthorizePageProps): ReactElement => (
  <Container>
    <Box my={4}>
      <Alert severity="error">{errorMessage}</Alert>
    </Box>
  </Container>
);

export default AuthorizePage;

export const getServerSideProps: GetServerSideProps = async context => {
  try {
    const { req, res } = context;
    await smart(req, res).ready();

    return { props: {}, redirect: { destination: '/', permanent: false } };
  } catch (error) {
    console.error(error);

    return {
      props: {
        errorMessage: error.message,
      },
    };
  }
};
