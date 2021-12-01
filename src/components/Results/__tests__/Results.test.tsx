import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResearchStudy } from 'fhir/r4';
import Results, { ResultsProps } from '../Results';
import { createMockRouter } from '@/utils/testUtils';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import mockStudies from '@/__mocks__/studies.json';

afterEach(() => {
  jest.clearAllMocks();
});

describe('<Results />', () => {
  const studies = mockStudies as ResearchStudy[];
  const mockedOnClick = jest.fn();
  const handleSaveStudy = jest.fn(() => mockedOnClick);

  const ComponentWithoutSelectedStudies = (props: Partial<ResultsProps>) => (
    <Results
      studies={studies}
      state={{ ids: new Set<string>(), savedStudies: studies }}
      handleSaveStudy={handleSaveStudy}
      {...props}
    />
  );

  const ComponentWithSelectedStudies = (props: Partial<ResultsProps>) => (
    <Results
      studies={studies}
      state={{
        ids: new Set<string>(['NCT03473639', 'NCT03964532']),
        savedStudies: [studies[1], studies[2]],
      }}
      handleSaveStudy={handleSaveStudy}
      {...props}
    />
  );

  const router = createMockRouter({
    query: { zipcode: '11111' },
  });

  it('renders save buttons for all studies when no studies are selected', () => {
    render(
      <RouterContext.Provider value={router}>
        <ComponentWithoutSelectedStudies />
      </RouterContext.Provider>
    );

    expect(screen.getByRole('heading', { name: /we found 6 matching trials\.\.\./i })).toBeInTheDocument();

    const saveButtons = screen.queryAllByRole('button', { name: /^save study$/i });
    expect(saveButtons.length).toBe(6);
    userEvent.click(saveButtons[0]);
    expect(mockedOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders an unsave button for every selected study', () => {
    render(
      <RouterContext.Provider value={router}>
        <ComponentWithSelectedStudies />
      </RouterContext.Provider>
    );

    expect(screen.getByRole('heading', { name: /we found 6 matching trials\.\.\./i })).toBeInTheDocument();

    const saveButtons = screen.queryAllByRole('button', { name: /^save study$/i });
    expect(saveButtons.length).toBe(4);

    const unsaveButtons = screen.queryAllByRole('button', { name: /unsave study/i });
    expect(unsaveButtons.length).toBe(2);
    userEvent.click(unsaveButtons[0]);
    userEvent.click(unsaveButtons[1]);
    expect(mockedOnClick).toHaveBeenCalledTimes(2);
  });
});
