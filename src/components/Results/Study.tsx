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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  return (
    <Accordion
      sx={{
        marginBottom: 2,
        '& .MuiAccordionSummary-root': { flexDirection: { xs: 'column', sm: 'row' } },
      }}
      onChange={(_event, expanded) => setIsExpanded(expanded)}
    >
      <StudyHeader isExpanded={isExpanded} studyId={study.id} studyProps={studyProps} />

      <AccordionDetails
        sx={{
          border: '5px solid',
          borderColor: isExpanded ? 'common.gray' : 'common.grayLighter',
          borderTop: 'none',
          p: 0,
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }}>
          <Stack flexGrow={1} p={2} sx={{ backgroundColor: 'common.white', maxHeight: '500px', overflowY: 'scroll' }}>
            <TableContainer>
              <Table size={isExtraLargeScreen ? 'medium' : 'small'} stickyHeader={!isExtraLargeScreen}>
                <TableBody>
                  {studyProps.details.map(({ header, body }, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        display: { xs: 'flex', xl: 'table-row' },
                        flexDirection: { xs: 'column', xl: 'row' },
                        '&:last-child td, &:last-child th': { xl: { border: 0 } },
                        '& td': {
                          xs: { border: 0 },
                          xl: { borderBottom: '1px solid rgba(224, 224, 224, 1)' },
                        },
                      }}
                    >
                      <TableCell
                        variant="head"
                        sx={{
                          textTransform: 'uppercase',
                          textAlign: { xs: 'left', xl: 'right' },
                          verticalAlign: 'top',
                        }}
                        component="th"
                      >
                        {header}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'pre-line' }} component="td">
                        {body}
                      </TableCell>
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
            {studyProps.contacts.map((contact, index) => (
              <StudyContact title="Contact" contact={contact} key={index} />
            ))}
            <StudyContact title="Closest Facility" contact={studyProps.closestFacility} />
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default Study;
