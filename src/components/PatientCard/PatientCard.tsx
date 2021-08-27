import React, { ReactElement } from 'react';
import { Box, Stack } from '@material-ui/core';
import { AccountCircle as AccountCircleIcon } from '@material-ui/icons';

import * as Styles from './PatientCard.styles';

import type { Patient } from '@/utils/patient';

export type PatientCardProps = {
  patient: Patient;
};

const PatientCard = ({ patient }: PatientCardProps): ReactElement => (
  <Styles.DarkCard>
    <Stack alignItems="center" direction="row">
      <Box pr={3} py={2}>
        <AccountCircleIcon fontSize="large" />
      </Box>

      <Box>
        <Box fontWeight={600}>{patient.name}</Box>

        <Stack direction="row">
          <Box width={80}>{patient.gender}</Box>
          <Box width={80}>{patient.age} yrs</Box>
        </Stack>
      </Box>
    </Stack>
  </Styles.DarkCard>
);

export default PatientCard;
