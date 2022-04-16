import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import FilterForm, { FilterFormProps } from '../FilterForm';
import { FilterFormValuesType } from '../types';

const defaultValues = {
  sortingOption: 'distance' as FilterFormValuesType['sortingOption'],
  // filterOptions: {
  //   recruitmentStatus: {
  //     active: true,
  //   },
  //   trialPhase: {
  //     'Phase 1': true,
  //   },
  //   studyType: {
  //     Interventional: true,
  //   },
  // },
};

const blankValues = {
  sortingOption: 'savedStatus' as FilterFormValuesType['sortingOption'],
  // filterOptions: {
  //   recruitmentStatus: {
  //     active: false,
  //   },
  //   trialPhase: {
  //     'Phase 1': false,
  //   },
  //   studyType: {
  //     Interventional: false,
  //   },
  // },
};

const filterOptions = {
  // recruitmentStatus: [
  //   { name: 'active', label: 'Active', count: 245 },
  //   { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
  //   { name: 'approved', label: 'Approved', count: 7 },
  // ],
  // trialPhase: [
  //   { name: 'Phase 2', count: 70 },
  //   { name: 'Phase 1', count: 58 },
  //   { name: 'Phase 1/Phase 2', count: 33 },
  //   { name: 'N/A', count: 45 },
  //   { name: 'Phase 3', count: 36 },
  //   { name: 'Phase 2/Phase 3', count: 2 },
  // ],
  // studyType: [
  //   { name: 'Interventional', count: 239 },
  //   { name: 'Observational', count: 11 },
  //   { name: 'Observational (Patient Registry)', count: 3 },
  // ],
} as FilterOptions;

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: Infinity,
      },
    },
  });

// MUI checkbox inputs don't change state when checked, there's an SVG element on top that changes.
const isChecked = (name: string, value?: string) => (_: string, element: HTMLElement) =>
  // element.querySelector(`[data-testid='${name}']`) &&
  // element.className.('Mui-checked') &&
  element.querySelector(`input[name='${name}']${value && `[value=${value}]`}`) &&
  (element.querySelector("[data-testid='RadioButtonCheckedIcon']") ||
    element.querySelector("[data-testid='CheckBoxIcon']")) &&
  true;

describe('<FilterForm />', () => {
  const Component = (props: Partial<FilterFormProps>) => (
    <QueryClientProvider client={createQueryClient()}>
      <FilterForm defaultValues={defaultValues} blankValues={blankValues} filterOptions={filterOptions} {...props} />
    </QueryClientProvider>
  );

  it('renders the filter form and all the filter form fields', () => {
    render(<Component />);

    expect(screen.getByRole('button', { name: /clear all/i }));

    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('sortingOption')).toHaveLength(3);

    expect(screen.getByText(/filter by/i)).toBeInTheDocument();
    expect(screen.getByText(/recruitment status/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('filterOptions.recruitmentStatus')).toHaveLength(3);

    expect(screen.getByText(/trial phase/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('filterOptions.trialPhase')).toHaveLength(6);

    expect(screen.getByText(/study type/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('filterOptions.studyType')).toHaveLength(3);

    expect(screen.getByRole('button', { name: 'Filter' }));
  });

  it.only('autopopulates with default data', () => {
    render(<Component />);

    screen.logTestingPlaygroundURL();

    // expect(screen.queryByTestId(isChecked('sortingOption', 'matchLikelihood'))).not.toBeInTheDocument();
    expect(screen.getByTestId(id => id.includes('.checked'))).toBeInTheDocument();
    // expect(screen.queryByTestId(isChecked('sortingOption', 'savedStatus'))).not.toBeInTheDocument();

    // expect(screen.queryByTestId(isChecked('filterOptions.recruitmentStatus.active'))).toBeInTheDocument();
    // expect(screen.queryByTestId(isChecked('filterOptions.trialPhase.Phase 1'))).toBeInTheDocument();
    // expect(screen.queryByTestId(isChecked('filterOptions.studyType.Interventional'))).toBeInTheDocument();
  });

  it('unchecks all checkboxes and resets radio button selection when the clear all button is clicked', () => {
    render(<Component />);

    screen.getByRole('button', { name: /clear all/i }).click();
    expect(screen.queryByTestId(isChecked('sortingOption', 'matchLikelihood'))).not.toBeInTheDocument();
    expect(screen.queryByTestId(isChecked('sortingOption', 'distance'))).not.toBeInTheDocument();
    expect(screen.queryByTestId(isChecked('sortingOption', 'savedStatus'))).toBeInTheDocument();
    // expect(screen.queryByTestId(isChecked('filterOptions.recruitmentStatus.active'))).not.toBeInTheDocument();
    // expect(screen.queryByTestId(isChecked('filterOptions.trialPhase.Phase 1'))).not.toBeInTheDocument();
    // expect(screen.queryByTestId(isChecked('filterOptions.studyType.Interventional'))).not.toBeInTheDocument();
  });
});
