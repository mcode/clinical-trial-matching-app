import type { ReactElement } from 'react';
import { Box, Stack } from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';

import type { Patient } from '@/utils/patient';

export type PatientCardProps = {
  patient: Patient;
};

const PatientCard = ({ patient }: PatientCardProps): ReactElement => (
  <Stack alignItems="center" bgcolor="grey.800" color="common.white" direction="row" height="80px" pl={3}>
    <Box pr={3} py={2}>
      <AccountCircleIcon fontSize="large" />
    </Box>

    <Box>
      <Box fontWeight={700}>{patient.name}</Box>

      <Stack direction="row">
        <Box width={80}>{patient.gender}</Box>
        <Box width={80}>{patient.age} yrs</Box>
      </Stack>
    </Box>
  </Stack>
);

export default PatientCard;
