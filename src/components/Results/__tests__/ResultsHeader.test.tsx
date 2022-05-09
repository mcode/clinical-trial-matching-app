import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsHeader, { ResultsHeaderProps } from '../ResultsHeader';

afterEach(() => {
  jest.clearAllMocks();
});

describe('<ResultsHeader />', () => {
  const isOpen = true;
  const showExport = true;
  const toggleDrawer = jest.fn();
  const toggleMobileDrawer = jest.fn();
  const handleClearSavedStudies = jest.fn();
  const handleExportStudies = jest.fn();

  const ComponentWithoutSelectedStudies = (props: Partial<ResultsHeaderProps>) => (
    <ResultsHeader
      isOpen={isOpen}
      toggleDrawer={toggleDrawer}
      toggleMobileDrawer={toggleMobileDrawer}
      hasSavedStudies={false}
      handleClearSavedStudies={handleClearSavedStudies}
      handleExportStudies={handleExportStudies}
      showExport={showExport}
      {...props}
    />
  );

  const ComponentWithSelectedStudies = (props: Partial<ResultsHeaderProps>) => (
    <ResultsHeader
      isOpen={isOpen}
      toggleDrawer={toggleDrawer}
      toggleMobileDrawer={toggleMobileDrawer}
      hasSavedStudies={true}
      handleClearSavedStudies={handleClearSavedStudies}
      handleExportStudies={handleExportStudies}
      showExport={showExport}
      {...props}
    />
  );

  it('renders button for exporting all studies when no studies are selected', () => {
    render(<ComponentWithoutSelectedStudies />);

    const exportButton = screen.getByRole('button', { name: /^export all$/i });
    expect(exportButton).toBeInTheDocument();
    userEvent.click(exportButton);
    expect(handleExportStudies).toHaveBeenCalledTimes(1);
  });

  it('renders buttons for clearing and exporting selected studies', () => {
    render(<ComponentWithSelectedStudies />);

    const clearButton = screen.getByRole('button', { name: /clear saved trials/i });
    expect(clearButton).toBeInTheDocument();
    userEvent.click(clearButton);
    expect(handleClearSavedStudies).toHaveBeenCalledTimes(1);

    const exportButton = screen.getByRole('button', { name: /export saved/i });
    expect(exportButton).toBeInTheDocument();
    userEvent.click(exportButton);
    expect(handleExportStudies).toHaveBeenCalledTimes(1);
  });
});
