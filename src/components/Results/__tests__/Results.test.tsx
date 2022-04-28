import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Results, { ResultsProps } from '../Results';
import mockSearchResults from '@/__mocks__/resultDetails.json';
import { StudyDetailProps } from '../types';
import { uninitializedState } from '@/utils/resultsStateUtils';
import { createMockRouter } from '@/utils/testUtils';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/queries/clinicalTrialPaginationQuery';

afterEach(() => {
  jest.clearAllMocks();
});

describe('<Results />', () => {
  const entries = [
    mockSearchResults.results[0],
    mockSearchResults.results[1],
    mockSearchResults.results[2],
  ] as StudyDetailProps[];

  const mockedOnClick = jest.fn();
  const handleSaveStudy = jest.fn(() => mockedOnClick);

  const router = createMockRouter({
    query: {
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    },
  });

  const ComponentWithoutSelectedStudies = (props: Partial<ResultsProps>) => (
    <Results
      response={{ results: entries, total: 123 }}
      state={uninitializedState}
      handleSaveStudy={handleSaveStudy}
      {...props}
    />
  );

  const ComponentWithSelectedStudies = (props: Partial<ResultsProps>) => (
    <Results
      response={{ results: entries, total: 123 }}
      state={new Set<string>(['NCT03473639', 'NCT03964532'])}
      handleSaveStudy={handleSaveStudy}
      {...props}
    />
  );

  it('renders the total number of studies', () => {
    render(
      <RouterContext.Provider value={router}>
        <ComponentWithoutSelectedStudies />
      </RouterContext.Provider>
    );

    expect(screen.getByRole('heading', { name: /we found 123 matching trials\.\.\./i })).toBeInTheDocument();
  });

  it('renders studies and save buttons for all studies when no studies are selected', () => {
    render(
      <RouterContext.Provider value={router}>
        <ComponentWithoutSelectedStudies />
      </RouterContext.Provider>
    );

    const saveButtons = screen.queryAllByRole('button', { name: /^save study$/i });
    expect(saveButtons.length).toBe(3);
    userEvent.click(saveButtons[0]);
    expect(mockedOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders studies and an unsave button for every selected study', () => {
    render(
      <RouterContext.Provider value={router}>
        <ComponentWithSelectedStudies />
      </RouterContext.Provider>
    );

    const saveButtons = screen.queryAllByRole('button', { name: /^save study$/i });
    expect(saveButtons.length).toBe(1);

    const unsaveButtons = screen.queryAllByRole('button', { name: /unsave study/i });
    expect(unsaveButtons.length).toBe(2);
    userEvent.click(unsaveButtons[0]);
    userEvent.click(unsaveButtons[1]);
    expect(mockedOnClick).toHaveBeenCalledTimes(2);
  });
});
