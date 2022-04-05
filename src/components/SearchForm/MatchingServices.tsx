import React, { ReactElement } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Box, FormControl, FormControlLabel, FormGroup, FormLabel, Stack } from '@mui/material';

import { MatchingServiceCheckbox } from './FormFields';
import { SearchFormValuesType } from './types';

type MatchingServicesProps = {
  control: Control<SearchFormValuesType>;
  fullWidth?: boolean;
};

const MATCHING_SERVICES = [
  // { name: 'breastCancerTrials', label: 'BreastCancerTrials.org', defaultValue: true },
  { name: 'trialjectory', label: 'Trialjectory', defaultValue: true },
  // { name: 'trialscope', label: 'Trialscope', defaultValue: false },
] as const;

const MatchingServices = ({ control, fullWidth }: MatchingServicesProps): ReactElement => (
  <Box bgcolor={theme => theme.palette.common.white} borderRadius="5px" px={1.5} py={0.5}>
    <FormControl component="fieldset">
      <FormLabel component="legend" sx={{ fontSize: '0.8em' }}>
        Matching Services
      </FormLabel>

      <FormGroup>
        <Stack direction={fullWidth ? 'column' : { xs: 'column', md: 'row' }}>
          {MATCHING_SERVICES.map(matchingService => (
            <FormControlLabel
              key={matchingService.name}
              control={
                <Controller
                  name={`matchingServices.${matchingService.name}`}
                  defaultValue={matchingService.defaultValue}
                  control={control}
                  render={MatchingServiceCheckbox}
                />
              }
              label={matchingService.label}
            />
          ))}
        </Stack>
      </FormGroup>
    </FormControl>
  </Box>
);

export default MatchingServices;
