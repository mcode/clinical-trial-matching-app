import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { act, render, screen } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { QueryClient, QueryClientProvider } from 'react-query';
import FilterForm, { FilterFormProps } from '../FilterForm';
import { FilterFormValuesType } from '../types';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const defaultValues = {
  sortingOption: 'distance' as FilterFormValuesType['sortingOption'],
  filterOptions: {
    recruitmentStatus: {
      active: true,
    },
    trialPhase: {
      'N/A': true,
    },
    studyType: {
      Interventional: true,
    },
  },
};

const blankValues = {
  sortingOption: 'savedStatus' as FilterFormValuesType['sortingOption'],
  filterOptions: {
    recruitmentStatus: {
      active: false,
    },
    trialPhase: {
      'N/A': false,
    },
    studyType: {
      Interventional: false,
    },
  },
};

const filterOptions = {
  recruitmentStatus: [
    { name: 'active', label: 'Active', count: 245 },
    { name: 'closed-to-accrual', label: 'Closed to Accrual', count: 1 },
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
      <FilterForm defaultValues={defaultValues} blankValues={blankValues} filterOptions={filterOptions} {...props} />
    </QueryClientProvider>
  );

  beforeEach(() => {
    mockRouter.push('/results');
  });

  it('renders the filter form and all the filter form fields', () => {
    render(<Component />);

    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('sortingOption')).toHaveLength(3);
    expect(screen.getByText(/filter by/i)).toBeInTheDocument();
    expect(screen.getByText(/recruitment status/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('filterOptions.recruitmentStatus')).toHaveLength(3);
    expect(screen.getByText(/trial phase/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('filterOptions.trialPhase')).toHaveLength(6);
    expect(screen.getByText(/study type/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('filterOptions.studyType')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
  });

  it('autopopulates with default data', () => {
    render(<Component />);

    expect(screen.queryByRole('radio', { name: /distance/i, checked: true })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /active/i, checked: true })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /n\/a/i, checked: true })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /interventional/i, checked: true })).toBeInTheDocument();
  });

  it('resets checkbox and radio button selection when the clear all button is clicked', () => {
    render(<Component />);
    act(() => {
      screen.getByRole('button', { name: /clear all/i }).click();
    });
    expect(screen.queryByRole('radio', { name: /saved status/i, checked: true })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /active/i, checked: false })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /n\/a/i, checked: false })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /interventional/i, checked: false })).toBeInTheDocument();
  });
});
