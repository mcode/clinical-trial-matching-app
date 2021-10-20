import { Typography } from '@mui/material';
import type { ReactElement } from 'react';
import React from 'react';
import ResultsAccordion from './ResultsAccordion';
import { Bundle, BundleEntry } from 'fhir/r4';

type ResultsProps = {
  data: Bundle;
};

const Results = ({ data }: ResultsProps): ReactElement => {
  const entries: BundleEntry[] = data.entry || [];
  const studies: BundleEntry[] = entries.filter(
    entry => entry.resource.resourceType && entry.resource.resourceType === 'ResearchStudy'
  );

  console.log('studies', studies);
  const length = studies.length;

  return (
    <>
      <Typography fontWeight="normal" variant="h6" mb={2}>
        {`We found `}
        <Typography display="inline" fontWeight={600} variant="h6" component="span" color="common.blue">
          {length}
        </Typography>
        {` matching trials...`}
      </Typography>
      {studies.map((entry: BundleEntry, index: number) => (
        <ResultsAccordion entry={entry} index={index} />
      ))}
    </>
  );
};

export default Results;
