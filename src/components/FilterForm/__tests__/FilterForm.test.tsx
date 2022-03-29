import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { render, screen, within } from '@testing-library/react';
import { ResearchStudy } from 'fhir/r4';
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
    } as { [key in ResearchStudy['status']]: boolean },
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

    const getCheckbox = (testId: string) => within(screen.getByTestId(testId)).getByRole('checkbox');

    // MUI checkboxes don't get checked, only the SVG elements change!
    // Maybe mock the Checkbox element?
    expect(getCheckbox('filterOptions.recruitmentStatus.active')).toHaveProperty('checked', true);
    expect(getCheckbox('filterOptions.trialPhase.Phase 1')).toHaveProperty('checked', true);
    expect(getCheckbox('Interventional')).toHaveProperty('checked', true);
    expect(getCheckbox('Observational (Patient Registry)')).toHaveProperty('checked', true);
  });
});
