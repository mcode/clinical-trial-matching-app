import { ChangeEvent, MouseEvent, PropsWithChildren, ReactElement } from 'react';
import { Pagination, TablePagination, Typography } from '@mui/material';
import { useRouter } from 'next/router';

import Study from './Study';
import { SavedStudiesState, SaveStudyHandler } from './types';
import { StudyDetailProps } from '.';
import { ResultsResponse } from '@/queries/clinicalTrialSearchQuery';
import { DEFAULT_PAGE } from '@/queries/clinicalTrialPaginationQuery';
import { TablePaginationActionsProps } from '@mui/material/TablePagination/TablePaginationActions';

export type ResultsProps = {
  response: ResultsResponse;
  state: SavedStudiesState;
  handleSaveStudy: (study: StudyDetailProps) => SaveStudyHandler;
};

const getPagination = ({
  count,
  page: newZeroIndexedPage,
  rowsPerPage,
  onPageChange: onChange,
  showFirstButton,
  showLastButton,
}: PropsWithChildren<TablePaginationActionsProps>) => (
  <Pagination
    {...{ onChange, showFirstButton, showLastButton }}
    count={Math.ceil(count / rowsPerPage)}
    page={newZeroIndexedPage + 1}
    shape="rounded"
  />
);

const Results = ({ response: { results, total }, state, handleSaveStudy }: ResultsProps): ReactElement => {
  const router = useRouter();
  const currentZeroIndexedPage = parseInt(router.query.page as string) - 1;
  const pageSize = parseInt(router.query.pageSize as string);

  const handleChangePage = (event: MouseEvent<HTMLButtonElement> | null, oneIndexedPage: number) =>
    router.push({
      pathname: '/results',
      query: { ...router.query, page: oneIndexedPage },
    });

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    router.push({
      pathname: '/results',
      query: { ...router.query, pageSize: event.target.value, page: DEFAULT_PAGE },
    });

  return (
    <>
      <Typography fontWeight="normal" mb={2} variant="h6">
        We found
        <Typography color="common.blueDarker" component="span" fontWeight={700} variant="h6">
          {` ${total} `}
        </Typography>
        matching trials...
      </Typography>

      {results.map((entry: StudyDetailProps) => (
        <Study
          key={entry.trialId}
          entry={entry}
          handleSaveStudy={handleSaveStudy(entry)}
          isStudySaved={state.has(entry.trialId)}
        />
      ))}

      <TablePagination
        count={total}
        onPageChange={handleChangePage}
        page={currentZeroIndexedPage}
        rowsPerPage={pageSize}
        component="div"
        labelRowsPerPage="Trials per page"
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        showFirstButton
        showLastButton
        ActionsComponent={getPagination}
      />
    </>
  );
};

export default Results;
