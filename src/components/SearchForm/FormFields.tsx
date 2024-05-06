import { Biomarker, CodedValueType, Score } from '@/utils/fhirConversionUtils';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { ReactElement } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { getJoinedCategories } from './FormFieldsOptions';
import { SearchFormValuesType } from './types';

const AutocompleteMulti = <T extends 'metastasis' | 'biomarkers' | 'radiation' | 'surgery' | 'medications'>({
  field,
  label,
  options,
  getOptionLabel,
}: {
  field: ControllerRenderProps<SearchFormValuesType, T>;
  label: string;
  options: CodedValueType[];
  getOptionLabel?: (option: CodedValueType) => string;
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid={label}
    freeSolo
    multiple
    onChange={(_, newValue: CodedValueType[]) => {
      field.onChange(newValue);
    }}
    options={options}
    getOptionLabel={getOptionLabel ?? ((option: CodedValueType) => option.display)}
    groupBy={getJoinedCategories}
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
  disabled,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'zipcode'>;
  disabled?: boolean;
}): ReactElement => (
  <TextField
    data-testid="zipcode"
    error={field.value === ''}
    fullWidth
    label="Zip Code"
    required
    disabled={disabled}
    variant="filled"
    {...field}
  />
);

export const TravelDistanceTextField = ({
  field,
  disabled,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'travelDistance'>;
  disabled?: boolean;
}): ReactElement => (
  <TextField
    data-testid="travelDistance"
    fullWidth
    label="Travel Distance (miles)"
    variant="filled"
    disabled={disabled}
    {...field}
  />
);

export const AgeTextField = ({
  field,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'age'>;
}): ReactElement => <TextField data-testid="age" fullWidth label="Age" type="number" variant="filled" {...field} />;

export const CancerTypeAutocomplete = ({
  field,
  cancerTypes,
  retrieveCancer,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'cancerType'>;
  cancerTypes: CodedValueType[];
  retrieveCancer: (value: CodedValueType) => void;
}): ReactElement => {
  return (
    <Autocomplete
      {...field}
      data-testid="cancerType"
      onChange={(_, newValue: CodedValueType) => {
        field.onChange(newValue);
        retrieveCancer(newValue);
      }}
      options={cancerTypes}
      getOptionLabel={(option: CodedValueType) => option.display}
      renderInput={params => (
        <TextField
          variant="filled"
          label="Cancer Type"
          placeholder=""
          required
          error={field.value === null}
          {...params}
        />
      )}
      isOptionEqualToValue={areCodedValueTypesEqual}
      groupBy={getJoinedCategories}
    />
  );
};

export const CancerSubtypeAutocomplete = ({
  field,
  cancerSubtypes,
  subtypeIsValid,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'cancerSubtype'>;
  cancerSubtypes: CodedValueType[];
  subtypeIsValid: () => boolean;
}): ReactElement => {
  return (
    <Autocomplete
      {...field}
      data-testid="cancerSubtype"
      onChange={(_, value) => field.onChange(value)}
      options={cancerSubtypes}
      getOptionLabel={(option: CodedValueType) => option.display}
      renderInput={params => (
        <TextField
          variant="filled"
          label="Cancer Subtype"
          placeholder=""
          error={!subtypeIsValid()}
          helperText={!subtypeIsValid() ? 'Invalid cancer subtype.' : undefined}
          {...params}
        />
      )}
      isOptionEqualToValue={areCodedValueTypesEqual}
      groupBy={getJoinedCategories}
    />
  );
};

export const CancerStageAutocomplete = ({
  field,
  stages,
  stageIsValid,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'stage'>;
  stages: CodedValueType[];
  stageIsValid: () => boolean;
}): ReactElement => {
  return (
    <Autocomplete
      {...field}
      data-testid="stage"
      onChange={(_, value) => field.onChange(value)}
      options={stages}
      getOptionLabel={(option: CodedValueType) => option.display}
      renderInput={params => (
        <TextField
          variant="filled"
          label="Stage"
          placeholder=""
          error={!stageIsValid()}
          helperText={!stageIsValid() ? 'Invalid stage.' : undefined}
          {...params}
        />
      )}
      isOptionEqualToValue={areCodedValueTypesEqual}
      groupBy={getJoinedCategories}
    />
  );
};

export const DiseaseStatusAutocomplete = ({
  field,
  options,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'diseaseStatus'>;
  options: CodedValueType[];
}): ReactElement => {
  return (
    <Autocomplete
      {...field}
      data-testid="diseaseStatus"
      onChange={(_, value) => field.onChange(value)}
      options={options}
      getOptionLabel={(option: CodedValueType) => option.display}
      renderInput={params => <TextField variant="filled" label="Disease Status" placeholder="" {...params} />}
      isOptionEqualToValue={areCodedValueTypesEqual}
    />
  );
};

export const PrimaryTumorStageAutocomplete = ({
  field,
  options,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'primaryTumorStage'>;
  options: CodedValueType[];
}): ReactElement => {
  return (
    <Autocomplete
      {...field}
      data-testid="primaryTumorStage"
      onChange={(_, value) => field.onChange(value)}
      options={options}
      getOptionLabel={(option: CodedValueType) => option.display}
      renderInput={params => <TextField variant="filled" label="Primary Tumor (T) Stage" placeholder="" {...params} />}
      isOptionEqualToValue={areCodedValueTypesEqual}
      groupBy={getJoinedCategories}
    />
  );
};

export const NodalDiseaseStageAutocomplete = ({
  field,
  options,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'nodalDiseaseStage'>;
  options: CodedValueType[];
}): ReactElement => {
  return (
    <Autocomplete
      {...field}
      data-testid="nodalDiseaseStage"
      onChange={(_, value) => field.onChange(value)}
      options={options}
      getOptionLabel={(option: CodedValueType) => option.display}
      renderInput={params => <TextField variant="filled" label="Nodal Disease (N) Stage" placeholder="" {...params} />}
      isOptionEqualToValue={areCodedValueTypesEqual}
      groupBy={getJoinedCategories}
    />
  );
};

export const MetastasesStageAutocomplete = ({
  field,
  options,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'metastasesStage'>;
  options: CodedValueType[];
}): ReactElement => {
  return (
    <Autocomplete
      {...field}
      data-testid="metastasesStage"
      onChange={(_, value) => field.onChange(value)}
      options={options}
      getOptionLabel={(option: CodedValueType) => option.display}
      renderInput={params => <TextField variant="filled" label="Metastases (M) Stage" placeholder="" {...params} />}
      isOptionEqualToValue={areCodedValueTypesEqual}
      groupBy={getJoinedCategories}
    />
  );
};

export const ECOGScoreAutocomplete = ({
  field,
  ecogScores,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'ecogScore'>;
  ecogScores: Score[];
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="ecogScore"
    onChange={(_, value) => field.onChange(value)}
    options={ecogScores}
    getOptionLabel={(option: Score) => option.valueInteger.toString()}
    renderInput={params => <TextField variant="filled" label="ECOG Score" placeholder="" {...params} />}
    isOptionEqualToValue={areScoresEqual}
  />
);

export const KarnofskyScoreAutocomplete = ({
  field,
  karnofskyScores,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'karnofskyScore'>;
  karnofskyScores: Score[];
}): ReactElement => (
  <Autocomplete
    {...field}
    data-testid="karnofskyScore"
    onChange={(_, value) => field.onChange(value)}
    options={karnofskyScores}
    getOptionLabel={(option: Score) => option.valueInteger.toString()}
    renderInput={params => <TextField variant="filled" label="Karnofsky Score" placeholder="" {...params} />}
    isOptionEqualToValue={areScoresEqual}
  />
);

export const MetastasisAutocomplete = ({
  field,
  metastases,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'metastasis'>;
  metastases: CodedValueType[];
}): ReactElement => <AutocompleteMulti field={field} label="metastasis" options={metastases} />;

export const BiomarkersAutocomplete = ({
  field,
  biomarkers,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'biomarkers'>;
  biomarkers: CodedValueType[];
}): ReactElement => {
  return (
    <AutocompleteMulti
      field={field}
      label="biomarkers"
      options={biomarkers}
      getOptionLabel={(option: Biomarker) => {
        const { display, qualifier } = { ...option };
        const positive = qualifier?.code === '10828004' && '+';
        const negative = qualifier?.code === '260385009' && '-';
        const sign = positive || negative;
        return `${display}${sign && ' ' + sign}`;
      }}
    />
  );
};

export const RadiationAutocomplete = ({
  field,
  radiations,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'radiation'>;
  radiations: CodedValueType[];
}): ReactElement => {
  return <AutocompleteMulti field={field} label="radiation" options={radiations} />;
};

export const SurgeryAutocomplete = ({
  field,
  surgeries,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'surgery'>;
  surgeries: CodedValueType[];
}): ReactElement => <AutocompleteMulti field={field} label="surgery" options={surgeries} />;

export const MedicationsAutocomplete = ({
  field,
  medications,
}: {
  field: ControllerRenderProps<SearchFormValuesType, 'medications'>;
  medications: CodedValueType[];
}): ReactElement => <AutocompleteMulti field={field} label="medications" options={medications} />;

export const areCodedValueTypesEqual = (first: CodedValueType, second: CodedValueType): boolean =>
  first?.code === second?.code && first?.system === second?.system;

const areScoresEqual = (first: Score, second: Score): boolean =>
  first.interpretation.code === second.interpretation.code &&
  first.interpretation.system === second.interpretation.system;
