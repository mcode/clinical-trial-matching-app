/* eslint-disable @typescript-eslint/no-unused-vars */
import { CodedValueType } from '@/utils/fhirConversionUtils';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { ReactElement, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { cancerTypeOptions } from './SearchFormOptions';
import { SearchFormValuesType } from './types';
const AutocompleteMulti = <T extends 'metastasis' | 'biomarkers' | 'radiation' | 'surgery' | 'medications'>({
  field,
  label,
  options,
}: {
  field: ControllerRenderProps<SearchFormValuesType, T>;
  label: string;
  options: (string | { display: string })[];
}): ReactElement => (
  <Autocomplete
    {...field}
    disabled={options === undefined || options === null || options?.length === 0 ? true : false}
    data-testid={label}
    freeSolo
    multiple
    onChange={(event, newValue) => {
      field.onChange(newValue);
    }}
    options={options}
    getOptionLabel={option => (typeof option === 'string' ? option : option?.display)}
    renderInput={params => (
      <TextField
        variant="filled"
        label={label.charAt(0).toUpperCase() + label.slice(1)}
        placeholder={`Add ${label}...`}
        {...params}
      />
    )}
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
  retrieveCancer,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'cancerType'>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  retrieveCancer: Function;
}): ReactElement => {
  const newOptions = cancerTypeOptions;

  return (
    <Autocomplete
      {...field}
      data-testid="cancerType"
      //loading={isLoading}
      onChange={(event, newValue) => {
        field.onChange(newValue);
        retrieveCancer(newValue);
      }}
      options={newOptions}
      getOptionLabel={option => String(option?.display ?? option?.code ?? '')}
      renderInput={params => <TextField variant="filled" label="Cancer Type" placeholder="" {...params} />}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

export const CancerSubtypeAutocomplete = ({
  field,
  cancerSubTypes,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'cancerSubtype'>;
  cancerSubTypes: CodedValueType[];
}): ReactElement => {
  const [initialValue] = useState(field.value);

  return (
    <Autocomplete
      {...field}
      data-testid="cancerSubtype"
      disabled={cancerSubTypes === null ? true : false}
      onChange={(_event, value) => field.onChange(value)}
      options={cancerSubTypes}
      getOptionLabel={option => String(option?.display ?? option?.code ?? '')}
      renderInput={params => <TextField variant="filled" label="Cancer Subtype" placeholder="" {...params} />}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

export const CancerStageAutocomplete = ({
  field,
  cancerStages,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'stage'>;
  cancerStages: CodedValueType[];
}): ReactElement => {
  const [initialValue] = useState(field.value);

  return (
    <Autocomplete
      {...field}
      data-testid="stage"
      disabled={cancerStages === null ? true : false}
      onChange={(_event, value) => field.onChange(value)}
      options={cancerStages}
      getOptionLabel={option => String(option?.display ?? option?.code ?? '')}
      renderInput={params => <TextField variant="filled" label="Stage" placeholder="" {...params} />}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

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
  // eslint-disable-next-line prettier/prettier
  <AutocompleteMulti field={field} label="metastasis" options={['metastasis-1', 'metastasis-2', 'metastasis-3']} />
);

export const BiomarkersAutocomplete = ({
  field,
  cancerBiomarkers,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'biomarkers'>;
  cancerBiomarkers: CodedValueType[];
}): ReactElement => {
  return <AutocompleteMulti field={field} label="biomarkers" options={cancerBiomarkers} />;
};

export const RadiationAutocomplete = ({
  field,
  radiations,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'radiation'>;
  radiations;
}): ReactElement => {
  return <AutocompleteMulti field={field} label="radiation" options={radiations} />;
};

export const SurgeryAutocomplete = ({
  field,
  cancerSurgery,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'surgery'>;
  cancerSurgery: CodedValueType[];
}): ReactElement => <AutocompleteMulti field={field} label="surgery" options={cancerSurgery} />;

export const MedicationsAutocomplete = ({
  field,
  cancerMedication,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'medications'>;
  cancerMedication;
}): ReactElement => <AutocompleteMulti field={field} label="medications" options={cancerMedication} />;
