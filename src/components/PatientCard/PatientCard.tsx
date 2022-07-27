import type { Patient } from '@/utils/fhirConversionUtils';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';

export type PatientCardProps = {
  patient: Patient;
};

const PatientCard = ({ patient }: PatientCardProps): ReactElement => (
  <Stack alignItems="center" bgcolor="grey.800" color="common.white" direction="row" px={3} py={2}>
    <Stack mr={3}>
      <AccountCircleIcon fontSize="large" />
    </Stack>

    <Box>
      <Typography fontWeight={700} data-testid="patientName">
        {patient.name}
      </Typography>
      <Stack direction="row">
        <Typography mr={2} data-testid="patientGender">
          {patient.gender}
        </Typography>
        <Typography data-testid="patientAge">{patient.age} yrs</Typography>
      </Stack>
    </Box>
  </Stack>
);

export default PatientCard;
