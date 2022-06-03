import React, { ReactElement } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Box, FormControl, FormControlLabel, FormGroup, FormLabel, Stack } from '@mui/material';

import { MatchingServiceCheckbox } from './FormFields';
import { SearchFormValuesType } from './types';
import getConfig from 'next/config';
import { Service } from '@/queries/clinicalTrialSearchQuery';

const {
  publicRuntimeConfig: { services },
} = getConfig();

type MatchingServicesProps = {
  control: Control<SearchFormValuesType>;
  fullWidth?: boolean;
};

const MatchingServices = ({ control, fullWidth }: MatchingServicesProps): ReactElement => (
  <Box bgcolor={theme => theme.palette.common.white} borderRadius="5px" px={1.5} py={0.5}>
    <FormControl component="fieldset">
      <FormLabel component="legend" sx={{ fontSize: '0.8em' }}>
        Matching Services
      </FormLabel>

      <FormGroup>
        <Stack direction={fullWidth ? 'column' : { xs: 'column', md: 'row' }}>
          {services.map(({ name, label, defaultValue = false }: Service) => (
            <FormControlLabel
              key={name}
              control={
                <Controller
                  name={`matchingServices.${name}`}
                  defaultValue={defaultValue}
                  control={control}
                  render={MatchingServiceCheckbox}
                />
              }
              label={label}
            />
          ))}
        </Stack>
      </FormGroup>
    </FormControl>
  </Box>
);

export default MatchingServices;
