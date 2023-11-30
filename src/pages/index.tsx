import { CircularProgress, Container } from '@mui/material';
import smart from 'fhirclient';
import { GetServerSideProps } from 'next';
import { ReactElement, useEffect, useState } from 'react';

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
    <Container>
      Please wait, loading patient data...
      <CircularProgress></CircularProgress>
    </Container>
  );
};

export default IndexPage;

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res } = context;

  try {
    await smart(req, res).ready();

    return { props: {} };
  } catch (e) {
    return { props: {}, redirect: { destination: '/launch', permanent: false } };
  }
};
