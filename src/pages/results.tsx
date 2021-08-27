import React, { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

const ResultsPage = (): ReactElement => (
  <>
    <Head>
      <title>Results | Clinical Trial Finder</title>
    </Head>
  </>
);

export default ResultsPage;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
