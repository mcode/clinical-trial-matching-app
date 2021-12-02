import { render, screen } from '@testing-library/react';
import { Bundle } from 'fhir/r4';
import Results, { ResultsProps } from '../Results';
import mockSearchResults from '@/__mocks__/results.json';

describe('<Results />', () => {
  const Component = (props: Partial<ResultsProps>) => <Results data={mockSearchResults as Bundle} {...props} />;

  it('renders the correct number of results', () => {
    render(<Component />);

    expect(screen.getByRole('heading', { name: /we found 6 matching trials\.\.\./i })).toBeInTheDocument();
  });
});
