import { render, screen } from '@testing-library/react';
import { Bundle } from 'fhir/r4';
import Results, { ResultsProps } from '../Results';
import mockSearchResults from '@/__mocks__/results.json';
import { createMockRouter } from '@/utils/testUtils';
import { RouterContext } from 'next/dist/shared/lib/router-context';

describe('<Results />', () => {
  const Component = (props: Partial<ResultsProps>) => (
    <Results data={{ results: mockSearchResults as Bundle }} {...props} />
  );

  it('renders the correct number of results', () => {
    const router = createMockRouter({
      query: { zipcode: '11111' },
    });

    render(
      <RouterContext.Provider value={router}>
        <Component />
      </RouterContext.Provider>
    );
    expect(screen.getByRole('heading', { name: /we found 6 matching trials\.\.\./i })).toBeInTheDocument();
  });
});
