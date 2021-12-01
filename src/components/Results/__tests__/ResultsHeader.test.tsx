import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResearchStudy } from 'fhir/r4';
import ResultsHeader, { ResultsHeaderProps } from '../ResultsHeader';
import mockStudies from '@/__mocks__/studies.json';

afterEach(() => {
  jest.clearAllMocks();
});

describe('<ResultsHeader />', () => {
  const studies = mockStudies as ResearchStudy[];

  const isOpen = true;
  const toggleDrawer = jest.fn();
  const toggleMobileDrawer = jest.fn();
  const handleClearSavedStudies = jest.fn();

  const ComponentWithoutSelectedStudies = (props: Partial<ResultsHeaderProps>) => (
    <ResultsHeader
      isOpen={isOpen}
      toggleDrawer={toggleDrawer}
      toggleMobileDrawer={toggleMobileDrawer}
      state={{ ids: new Set<string>(), savedStudies: studies }}
      handleClearSavedStudies={handleClearSavedStudies}
      {...props}
    />
  );

  const ComponentWithSelectedStudies = (props: Partial<ResultsHeaderProps>) => (
    <ResultsHeader
      isOpen={isOpen}
      toggleDrawer={toggleDrawer}
      toggleMobileDrawer={toggleMobileDrawer}
      state={{
        ids: new Set<string>(['NCT03473639', 'NCT03964532']),
        savedStudies: [studies[1], studies[2]],
      }}
      handleClearSavedStudies={handleClearSavedStudies}
      {...props}
    />
  );

  it('renders button for exporting all studies when no studies are selected', () => {
    render(<ComponentWithoutSelectedStudies />);

    const exportButton = screen.getByRole('button', { name: /^export all$/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('renders buttons for clearing and exporting selected studies', () => {
    render(<ComponentWithSelectedStudies />);

    const clearButton = screen.getByRole('button', { name: /clear saved trials/i });
    expect(clearButton).toBeInTheDocument();
    userEvent.click(clearButton);
    expect(handleClearSavedStudies).toHaveBeenCalledTimes(1);

    const exportButton = screen.getByRole('button', { name: /export saved/i });
    expect(exportButton).toBeInTheDocument();
  });
});
