import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import FilterForm, { FilterFormProps } from '../FilterForm';

const defaultValues = {
  sortingOptions: {
    matchLikelihood: false,
    distance: true,
    savedStatus: false,
  },
  filterOptions: {
    recruitmentStatus: {
      active: true,
    },
    trialPhase: {
      'Phase 1': true,
    },
    studyType: {
      Interventional: true,
      'Observational (Patient Registry)': true,
    },
  },
};

const filterOptions = {
  recruitmentStatus: [
    { name: 'active', label: 'Active', count: 245 },
    { name: 'closed-to-accrual', label: 'Closed to accrual', count: 1 },
    { name: 'approved', label: 'Approved', count: 7 },
  ],
  trialPhase: [
    { name: 'Phase 2', count: 70 },
    { name: 'Phase 1', count: 58 },
    { name: 'Phase 1/Phase 2', count: 33 },
    { name: 'N/A', count: 45 },
    { name: 'Phase 3', count: 36 },
    { name: 'Phase 2/Phase 3', count: 2 },
  ],
  studyType: [
    { name: 'Interventional', count: 239 },
    { name: 'Observational', count: 11 },
    { name: 'Observational (Patient Registry)', count: 3 },
  ],
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
const checkboxExists = (name: string) => (_: string, element: HTMLElement) =>
  element.querySelector(`input[name='${name}']`) && element.querySelector("[data-testid='CheckBoxIcon']") && true;

describe('<FilterForm />', () => {
  const Component = (props: Partial<FilterFormProps>) => (
    <QueryClientProvider client={createQueryClient()}>
      <FilterForm defaultValues={defaultValues} filterOptions={filterOptions} {...props} />
    </QueryClientProvider>
  );

  it('renders the filter form and all the filter form fields', () => {
    render(<Component />);

    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('sortingOptions')).toHaveLength(3);

    expect(screen.getByText(/filter by/i)).toBeInTheDocument();
    expect(screen.getByText(/recruitment status/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('filterOptions.recruitmentStatus')).toHaveLength(3);

    expect(screen.getByText(/trial phase/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('filterOptions.trialPhase')).toHaveLength(6);

    expect(screen.getByText(/study type/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('filterOptions.studyType')).toHaveLength(3);

    expect(screen.getByRole('button', { name: 'Filter' }));
  });

  it('autopopulates with default data', () => {
    render(<Component />);

    expect(screen.queryByTestId(checkboxExists('sortingOptions.matchLikelihood'))).not.toBeInTheDocument();
    expect(screen.queryByTestId(checkboxExists('sortingOptions.distance'))).toBeInTheDocument();
    expect(screen.queryByTestId(checkboxExists('sortingOptions.savedStatus'))).not.toBeInTheDocument();

    expect(screen.queryByTestId(checkboxExists('filterOptions.recruitmentStatus.active'))).toBeInTheDocument();

    expect(screen.queryByTestId(checkboxExists('filterOptions.trialPhase.Phase 1'))).toBeInTheDocument();

    expect(screen.queryByTestId(checkboxExists('filterOptions.studyType.Interventional'))).toBeInTheDocument();
    expect(
      screen.queryByTestId(checkboxExists('filterOptions.studyType.Observational (Patient Registry)'))
    ).toBeInTheDocument();
  });
});
