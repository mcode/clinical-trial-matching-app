import { ReactElement, useState } from 'react';
import { ResearchStudy } from 'fhir/r4';
import {
  Accordion,
  AccordionDetails,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { Launch as LaunchIcon, Save as SaveIcon } from '@mui/icons-material';

import StudyContact from './StudyContact';
import StudyDetailsButton from './StudyDetailsButton';
import StudyHeader from './StudyHeader';
import { getStudyProps } from './utils';

type StudyProps = {
  study: ResearchStudy;
};

const Study = ({ study }: StudyProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  const studyProps = getStudyProps(study);

  return (
    <Accordion sx={{ marginBottom: 2 }} onChange={(_event, expanded) => setIsExpanded(expanded)}>
      <StudyHeader isExpanded={isExpanded} studyId={study.id} studyProps={studyProps} />

      <AccordionDetails
        sx={{
          border: '5px solid',
          borderColor: isExpanded ? 'common.gray' : 'common.grayLighter',
          borderTop: 'none',
          p: 0,
        }}
      >
        <Stack direction={{ xs: 'column', xl: 'row' }}>
          <Stack flexGrow={1} p={2} sx={{ backgroundColor: 'common.white', maxHeight: '500px', overflowY: 'scroll' }}>
            <TableContainer>
              <Table>
                <TableBody>
                  {studyProps.details.map(({ header, body }, index) => (
                    <TableRow key={index}>
                      <TableCell
                        variant="head"
                        sx={{ textTransform: 'uppercase', textAlign: 'right', verticalAlign: 'top' }}
                      >
                        {header}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'pre-line' }}>{body}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>

          <Stack p={2} sx={{ backgroundColor: 'common.grayLighter' }}>
            <StudyDetailsButton icon={<LaunchIcon />} text="More info" />
            <StudyDetailsButton icon={<SaveIcon />} text="Save study" />
            <StudyContact title="Sponsor" contact={studyProps.sponsor} />
            <StudyContact title="Closest Facility" contact={studyProps.closestFacility} />
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default Study;
