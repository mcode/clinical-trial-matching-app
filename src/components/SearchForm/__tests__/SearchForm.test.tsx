import { render, screen } from '@testing-library/react';
import SearchForm, { SearchFormProps } from '../SearchForm';
import mockPatient from '@/__mocks__/patient';

describe('<SearchForm />', () => {
  const Component = (props: Partial<SearchFormProps>) => <SearchForm patient={mockPatient} {...props} />;

  it('renders the search form and all the search form fields', () => {
    render(<Component />);

    expect(screen.getByText(/let's find some clinical trials/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('matchingServices')).toHaveLength(3);
    expect(screen.getByTestId('zipcode')).toBeInTheDocument();
    expect(screen.getByTestId('travelDistance')).toBeInTheDocument();
    expect(screen.getByTestId('age')).toBeInTheDocument();
    expect(screen.getByTestId('cancerType')).toBeInTheDocument();
    expect(screen.getByTestId('cancerSubtype')).toBeInTheDocument();
    expect(screen.getByTestId('metastasis')).toBeInTheDocument();
    expect(screen.getByTestId('stage')).toBeInTheDocument();
    expect(screen.getByTestId('ecogScore')).toBeInTheDocument();
    expect(screen.getByTestId('karnofskyScore')).toBeInTheDocument();
    expect(screen.getByTestId('biomarkers')).toBeInTheDocument();
    expect(screen.getByTestId('radiation')).toBeInTheDocument();
    expect(screen.getByTestId('surgery')).toBeInTheDocument();
    expect(screen.getByTestId('medications')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i }));
  });

  it('autopopulates with default or patient data', () => {
    render(<Component />);

    expect(screen.getByTestId('zipcode')).toContainHTML('11111');
    expect(screen.getByTestId('travelDistance')).toContainHTML('100');
    expect(screen.getByTestId('age')).toContainHTML('28');
    expect(screen.getByTestId('cancerType')).toContainHTML('Breast');
  });
});
