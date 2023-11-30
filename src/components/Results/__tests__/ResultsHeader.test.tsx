import { render } from '@testing-library/react';
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
      handleExportCsvStudies={handleExportStudies}
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
      handleExportCsvStudies={handleExportStudies}
      showExport={showExport}
      {...props}
    />
  );
  it('renders button for exporting all studies when no studies are selected', () => {
    render(<ComponentWithoutSelectedStudies />);
  });
  it('renders buttons for clearing and exporting selected studies', () => {
    render(<ComponentWithSelectedStudies />);
  });
});
