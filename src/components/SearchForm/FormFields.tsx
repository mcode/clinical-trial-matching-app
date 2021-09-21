import React, { ReactElement } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Autocomplete, Checkbox, TextField } from '@mui/material';

import { SearchFormValuesType } from './types';

export const MatchingServiceCheckbox = ({
  field,
}: {
  field: ControllerRenderProps<
    SearchFormValuesType,
    `matchingServices.${keyof SearchFormValuesType['matchingServices']}`
  >;
}): ReactElement => <Checkbox {...field} checked={field.value} data-testid="matchingServices" value="on" />;

export const ZipcodeTextField = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'zipcode'>;
}): ReactElement => <TextField data-testid="zipcode" fullWidth label="Zip Code" required variant="filled" {...field} />;

export const TravelDistanceTextField = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'travelDistance'>;
}): ReactElement => (
  <TextField data-testid="travelDistance" fullWidth label="Travel Distance (miles)" variant="filled" {...field} />
);

export const AgeTextField = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'age'>;
}): ReactElement => <TextField data-testid="age" fullWidth label="Age" type="number" variant="filled" {...field} />;

export const CancerTypeTextField = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'cancerType'>;
}): ReactElement => (
  <TextField data-testid="cancerType" fullWidth label="Cancer Type" required variant="filled" {...field} />
);

export const CancerSubtypeTextField = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'cancerSubtype'>;
}): ReactElement => (
  <TextField data-testid="cancerSubtype" fullWidth label="Cancer Subtype" variant="filled" {...field} />
);

export const MetastasisTextField = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'metastasis'>;
}): ReactElement => <TextField data-testid="metastasis" fullWidth label="Metastasis" variant="filled" {...field} />;

export const CancerStageAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'stage'>;
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="stage"
    onChange={(_event, value) => field.onChange(value)}
    options={['0', 'I', 'II', 'III', 'IV']}
    renderInput={params => <TextField variant="filled" label="Stage" placeholder="" {...params} />}
  />
);

export const ECOGScoreAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'ecogScore'>;
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="ecogScore"
    onChange={(_event, value) => field.onChange(value)}
    options={['0', '1', '2', '3', '4', '5']}
    renderInput={params => <TextField variant="filled" label="ECOG Score" placeholder="" {...params} />}
  />
);

export const KarnofskyScoreAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'karnofskyScore'>;
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="karnofskyScore"
    onChange={(_event, value) => field.onChange(value)}
    options={['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']}
    renderInput={params => <TextField variant="filled" label="Karnofsky Score" placeholder="" {...params} />}
  />
);

export const BiomarkersAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'biomarkers'>;
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="biomarkers"
    multiple
    onChange={(_event, value) => field.onChange(value)}
    options={['biomarker-1', 'biomarker-2', 'biomarker-3']}
    renderInput={params => <TextField variant="filled" label="Biomarkers" placeholder="Add biomarker..." {...params} />}
  />
);

export const RadiationAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'radiation'>;
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="radiation"
    multiple
    onChange={(_event, value) => field.onChange(value)}
    options={['radiation-1', 'radiation-2', 'radiation-3']}
    renderInput={params => <TextField variant="filled" label="Radiation" placeholder="Add radiation..." {...params} />}
  />
);

export const SurgeryAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'surgery'>;
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="surgery"
    multiple
    onChange={(_event, value) => field.onChange(value)}
    options={['surgery-1', 'surgery-2', 'surgery-3']}
    renderInput={params => <TextField variant="filled" label="Surgery" placeholder="Add surgery..." {...params} />}
  />
);

export const MedicationsAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'medications'>;
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="medications"
    multiple
    onChange={(_event, value) => field.onChange(value)}
    options={['medication-1', 'medication-2', 'medication-3']}
    renderInput={params => (
      <TextField {...params} variant="filled" label="Medications" placeholder="Add medication..." />
    )}
  />
);
