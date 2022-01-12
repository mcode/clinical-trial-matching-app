import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Results, { ResultsProps } from '../Results';
import mockSearchResults from '@/__mocks__/results.json';
import { BundleEntry, ContactProps } from '../types';
import { uninitializedState } from '@/utils/resultsStateUtils';

afterEach(() => {
  jest.clearAllMocks();
});

describe('<Results />', () => {
  const entries = [mockSearchResults.entry[0], mockSearchResults.entry[1], mockSearchResults.entry[2]] as BundleEntry[];
  const closestFacilities: ContactProps[] = [
    { name: 'Facility 1', distance: '10 miles' },
    { name: 'Facility 2', distance: '20 miles' },
    { name: 'Facility 3', distance: '30 miles' },
  ];

  const mockedOnClick = jest.fn();
  const handleSaveStudy = jest.fn(() => mockedOnClick);

  const ComponentWithoutSelectedStudies = (props: Partial<ResultsProps>) => (
    <Results
      entries={entries}
      state={uninitializedState}
      handleSaveStudy={handleSaveStudy}
      closestFacilities={closestFacilities}
      {...props}
    />
  );

  const ComponentWithSelectedStudies = (props: Partial<ResultsProps>) => (
    <Results
      entries={entries}
      state={new Set<string>(['NCT03473639', 'NCT03964532'])}
      handleSaveStudy={handleSaveStudy}
      closestFacilities={closestFacilities}
      {...props}
    />
  );

  it('renders save buttons for all studies when no studies are selected', () => {
    render(<ComponentWithoutSelectedStudies />);

    expect(screen.getByRole('heading', { name: /we found 3 matching trials\.\.\./i })).toBeInTheDocument();

    const saveButtons = screen.queryAllByRole('button', { name: /^save study$/i });
    expect(saveButtons.length).toBe(3);
    userEvent.click(saveButtons[0]);
    expect(mockedOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders an unsave button for every selected study', () => {
    render(<ComponentWithSelectedStudies />);

    expect(screen.getByRole('heading', { name: /we found 3 matching trials\.\.\./i })).toBeInTheDocument();

    const saveButtons = screen.queryAllByRole('button', { name: /^save study$/i });
    expect(saveButtons.length).toBe(1);

    const unsaveButtons = screen.queryAllByRole('button', { name: /unsave study/i });
    expect(unsaveButtons.length).toBe(2);
    userEvent.click(unsaveButtons[0]);
    userEvent.click(unsaveButtons[1]);
    expect(mockedOnClick).toHaveBeenCalledTimes(2);
  });
});
