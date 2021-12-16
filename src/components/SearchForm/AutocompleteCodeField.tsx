import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';

export type AutocompleteCodeValue = {
  display: string;
};

export type AutocompleteCodeFieldProps<T extends AutocompleteCodeValue> = {
  'data-testid'?: string;
  initialValue: T;
  codeLoader: () => Promise<T[]>;
  required?: boolean;
  label?: string;
};

export type AutocompleteCodeFieldState<T extends AutocompleteCodeValue> = {
  open: boolean;
  loading: boolean;
  options: T[];
  value: T;
};

export class AutocompleteCodeField<T extends AutocompleteCodeValue> extends React.Component<
  AutocompleteCodeFieldProps<T>,
  AutocompleteCodeFieldState<T>
> {
  loaded = false;
  optionLoadPromise: Promise<T[]> | null = null;
  constructor(props: Readonly<AutocompleteCodeFieldProps<T>>) {
    super(props);
    this.state = {
      open: false,
      loading: false,
      options: [props.initialValue],
      value: props.initialValue,
    };
  }
  setOpen(open: boolean): void {
    let loading = !this.loaded && this.optionLoadPromise !== null;
    // The first time the state is set to open, also start loading
    if (open && !this.loaded && this.optionLoadPromise === null) {
      this.optionLoadPromise = this.props.codeLoader().then(codes => {
        this.loaded = true;
        // If we already have options, append the new ones to the end
        this.setState({ options: this.state.options.concat(codes), loading: false });
        return codes;
      });
      loading = true;
    }
    this.setState({ open: open, loading: loading });
  }
  setValue(value: T | string): void {
    if (typeof value === 'string') {
      // In this case, we have to lookup the value - this appears to happen
      // rarely (if ever) so it just does a linear lookup
      console.log('looking up %s', value);
      for (const c of this.state.options) {
        if (c.display === value) {
          this.setState({ value: c });
          break;
        }
      }
    } else {
      this.setState({ value: value });
    }
  }
  render(): ReactElement {
    return (
      <Autocomplete
        data-testid={this.props['data-testid']}
        value={this.state.value !== null && this.state.value !== undefined ? (this.state.value as NonNullable<T>) : ''}
        open={this.state.open}
        onOpen={() => {
          this.setOpen(true);
        }}
        onClose={() => {
          this.setOpen(false);
        }}
        onChange={(_event, value) => {
          this.setValue(value);
        }}
        loading={this.state.loading}
        getOptionLabel={option => {
          return option?.display || '';
        }}
        isOptionEqualToValue={(option, value) => {
          // value may either be a selected option or a user-entered string
          // option may be null or undefined if the value is unknown
          if (option) {
            return option.display === (typeof value === 'string' ? value : value?.display);
          } else {
            return value === null || (value as unknown) === '';
          }
        }}
        options={this.state.options}
        renderInput={params => (
          <TextField
            error={this.props.required && (!this.state.value || this.state.value.display === '')}
            required={this.props.required}
            variant="filled"
            fullWidth
            label={this.props.label}
            {...params}
          />
        )}
      />
    );
  }
}
