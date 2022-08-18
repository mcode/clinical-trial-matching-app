import { Box, Stack } from '@mui/material';
import type { ReactElement } from 'react';
import React from 'react';
import { ArmGroup } from '.';

const ArmInterventions = ({ display, description, interventions }: ArmGroup): ReactElement => (
  <Stack pb={2}>
    <Box fontWeight="700" sx={{ textTransform: 'uppercase' }}>
      {display}
    </Box>

    {description && <Box>{description}</Box>}

    {interventions && interventions.length > 0 && (
      <Stack>
        <Box fontWeight="600" ml={2} sx={{ textTransform: 'uppercase' }}>
          Interventions
        </Box>
        <Stack>
          {interventions.map((intervention, index) => (
            <Stack pb={2} key={index}>
              <Box ml={4} fontWeight="600" sx={{ textTransform: 'uppercase' }}>
                {intervention.type ? `${intervention.type}:` : ''} {intervention.title}{' '}
                {intervention.subtitle ? `(${intervention.subtitle})` : ''}
              </Box>
              {intervention.description && <Box ml={4}>{intervention.description}</Box>}
            </Stack>
          ))}
        </Stack>
      </Stack>
    )}
  </Stack>
);

export default ArmInterventions;
