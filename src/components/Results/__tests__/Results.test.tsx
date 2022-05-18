import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/queries/clinicalTrialPaginationQuery';
import { uninitializedState } from '@/utils/resultsStateUtils';
import { createMockRouter } from '@/utils/testUtils';
import mockSearchResults from '@/__mocks__/resultDetails.json';
import { Stack } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { MutableRefObject, useRef } from 'react';
import Results, { ResultsProps } from '../Results';
import { StudyDetailProps } from '../types';

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

  // Don't re-implement React's codebase
  const Parent = ({ state, ...props }: Partial<ResultsProps>) => {
    const ref: MutableRefObject<HTMLElement> = useRef<HTMLElement>(null);
    return (
      <Stack ref={ref} data-testid="parent" style={{ overflowY: 'auto' }}>
        <Results
          response={{ results: entries, total: 123 }}
          state={state}
          handleSaveStudy={handleSaveStudy}
          scrollableParent={ref}
          {...props}
        />
      </Stack>
    );
  };

  const ComponentWithoutSelectedStudies = (props: Partial<ResultsProps>) => (
    <Parent state={uninitializedState} {...props} />
  );

  const ComponentWithSelectedStudies = (props: Partial<ResultsProps>) => (
    <Parent state={new Set<string>(['NCT03473639', 'NCT03964532'])} {...props} />
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
