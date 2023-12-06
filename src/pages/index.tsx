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
  // FIXME: Next.js 13 broke something, see https://github.com/vercel/next.js/issues/57397
  // For now, remove the x-forwarded headers, they break fhirclient
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-port'];
  delete req.headers['x-forwarded-proto'];
  delete req.headers['x-forwarded-for'];

  try {
    await smart(req, res).ready();

    return { props: {} };
  } catch (e) {
    console.error('Error starting SMART on FHIR');
    console.error(e);
    return { props: {}, redirect: { destination: '/launch', permanent: false } };
  }
};
