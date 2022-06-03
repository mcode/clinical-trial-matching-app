import { fetchCancerSubtypeCodesQuery, fetchCancerTypeCodesQuery } from '@/queries';
import { Autocomplete, Checkbox, Chip, TextField, Typography } from '@mui/material';
import { ReactElement, useMemo, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { useQuery } from 'react-query';
import { SearchFormValuesType } from './types';

const AutocompleteMulti = ({ field, label, options }): ReactElement => (
  <Autocomplete
    {...field}
    data-testid={label}
    freeSolo
    multiple
    onChange={(_event, value) => field.onChange(value)}
    options={options}
    renderInput={params => (
      <TextField
        variant="filled"
        label={label.charAt(0).toUpperCase() + label.slice(1)}
        placeholder={`Add ${label}...`}
        {...params}
      />
    )}
    renderTags={(value, getTagProps) =>
      value.map((option, index) => (
        <Chip
          label={
            <Typography fontSize="0.8rem" py={0.8} whiteSpace="normal">
              {option}
            </Typography>
          }
          sx={{ height: '100%' }}
          {...getTagProps({ index })}
        />
      ))
    }
    sx={{ '& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': { width: 'auto' } }}
  />
);

// ----- FIELDS ----- //

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
}): ReactElement => (
  <TextField
    data-testid="zipcode"
    error={field.value === ''}
    fullWidth
    label="Zip Code"
    required
    variant="filled"
    {...field}
  />
);

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

export const CancerTypeAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'cancerType'>;
}): ReactElement => {
  const { data, isLoading } = useQuery(['cancer-type-codes'], () => fetchCancerTypeCodesQuery(), {
    enabled: typeof window !== 'undefined',
  });
  const [initialValue] = useState(field.value);
  const options = useMemo(() => [initialValue, ...(data || [])].filter(Boolean), [initialValue, data]);

  return (
    <Autocomplete
      {...field}
      data-testid="cancerType"
      loading={isLoading}
      onChange={(_event, value) => field.onChange(value)}
      options={options}
      getOptionLabel={option => String(option?.display ?? option?.code ?? '')}
      renderInput={params => <TextField variant="filled" label="Cancer Type" placeholder="" {...params} />}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

export const CancerSubtypeAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'cancerSubtype'>;
}): ReactElement => {
  const { data, isLoading } = useQuery(['cancer-subtype-codes'], () => fetchCancerSubtypeCodesQuery(), {
    enabled: typeof window !== 'undefined',
  });
  const [initialValue] = useState(field.value);
  const options = useMemo(() => [initialValue, ...(data || [])].filter(Boolean), [initialValue, data]);

  return (
    <Autocomplete
      {...field}
      data-testid="cancerSubtype"
      loading={isLoading}
      onChange={(_event, value) => field.onChange(value)}
      options={options}
      getOptionLabel={option => String(option?.display ?? option?.code ?? '')}
      renderInput={params => <TextField variant="filled" label="Cancer Subtype" placeholder="" {...params} />}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

export const CancerStageAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'stage'>;
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="stage"
    onChange={(_event, value) => field.onChange(value)}
    options={['0', 'I', 'II', 'IIA', 'III', 'IV']}
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

export const MetastasisAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'metastasis'>;
}): ReactElement => (
  <AutocompleteMulti field={field} label="metastasis" options={['metastasis-1', 'metastasis-2', 'metastasis-3']} />
);

export const BiomarkersAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'biomarkers'>;
}): ReactElement => (
  <AutocompleteMulti field={field} label="biomarkers" options={['biomarker-1', 'biomarker-2', 'biomarker-3']} />
);

export const RadiationAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'radiation'>;
}): ReactElement => (
  <AutocompleteMulti field={field} label="radiation" options={['radiation-1', 'radiation-2', 'radiation-3']} />
);

export const SurgeryAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'surgery'>;
}): ReactElement => (
  <AutocompleteMulti field={field} label="surgery" options={['surgery-1', 'surgery-2', 'surgery-3']} />
);

export const MedicationsAutocomplete = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'medications'>;
}): ReactElement => (
  <AutocompleteMulti field={field} label="medications" options={['medication-1', 'medication-2', 'medication-3']} />
);
