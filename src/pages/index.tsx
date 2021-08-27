import { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import smart from 'fhirclient';

const IndexPage = (): ReactElement => null;

export default IndexPage;

export const getServerSideProps: GetServerSideProps = async context => {
  const { req, res } = context;

  try {
    await smart(req, res).ready();

    return { props: {}, redirect: { destination: '/search', permanent: false } };
  } catch (e) {
    return { props: {}, redirect: { destination: '/launch', permanent: false } };
  }
};
