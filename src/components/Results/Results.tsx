import type { ReactElement } from 'react';
import { Bundle, BundleEntry, ResearchStudy } from 'fhir/r4';
import { Typography } from '@mui/material';

import Study from './Study';

export type ResultsProps = {
  data: ResultsResponse;
};

export type ResultsResponse = {
  results?: Bundle;
  errors?: ErrorResponse[];
}

export type ErrorResponse = {
  status: string;
  response: string;
}

const Results = ({ data }: ResultsProps): ReactElement => {
  console.log(data);
  const entries: BundleEntry[] = data?.results?.entry || [];
  const studies = entries.filter(({ resource }) => resource?.resourceType === 'ResearchStudy');

  return (
    <>
      <Typography fontWeight="normal" mb={2} variant="h6">
        We found
        <Typography color="common.blueDarker" component="span" fontWeight={700} variant="h6">
          {` ${studies.length} `}
        </Typography>
        matching trials...
      </Typography>

      {studies.map((study: BundleEntry) => (
        <Study key={study.resource.id} study={study.resource as ResearchStudy} />
      ))}
    </>
  );
};

export default Results;
