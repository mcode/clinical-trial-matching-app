import { ReactElement, useState, memo, MutableRefObject } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Launch as LaunchIcon, Save as SaveIcon } from '@mui/icons-material';
import StudyContact from './StudyContact';
import StudyDetailsButton from './StudyDetailsButton';
import StudyHeader from './StudyHeader';
import { getDetails } from './utils';
import { SaveStudyHandler } from './types';
import UnsaveIcon from './UnsaveIcon';
import { StudyDetailProps } from '.';
import ArmInterventions from './ArmInterventions';

type StudyProps = {
  entry: StudyDetailProps;
  handleSaveStudy: SaveStudyHandler;
  isStudySaved: boolean;
  scrollableParent: MutableRefObject<HTMLElement>;
};

const Study = ({ entry, handleSaveStudy, isStudySaved, scrollableParent }: StudyProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  const details = getDetails(entry);
  const theme = useTheme();
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const closestFacilities = entry?.closestFacilities || [];

  return (
    <Accordion sx={{ marginBottom: 2 }} onChange={(_event, expanded) => setIsExpanded(expanded)}>
      <StudyHeader isExpanded={isExpanded} study={entry} {...{ handleSaveStudy, isStudySaved, scrollableParent }} />

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
                  {details.map(({ header, body }, index) => (
                    <TableRow key={index}>
                      <TableCell variant="head" component="th">
                        {header}
                      </TableCell>

                      <TableCell variant="body" component="td">
                        {body}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Arms and Interventions  */}
                  {entry.arms && entry.arms.length > 0 && (
                    <TableRow key={details.length}>
                      <TableCell variant="head" component="th">
                        Arms and Interventions
                      </TableCell>

                      <TableCell variant="body" component="td">
                        <Stack>
                          {entry.arms.map((arm, index) => (
                            <ArmInterventions
                              key={index}
                              display={arm.display}
                              description={arm.description}
                              interventions={arm.interventions}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>

          <Stack p={2} sx={{ backgroundColor: 'common.grayLighter' }}>
            <StudyDetailsButton
              icon={<LaunchIcon />}
              text="More info"
              target="_blank"
              href={'https://www.clinicaltrials.gov/ct2/show/' + entry.trialId}
            />
            <StudyDetailsButton
              icon={isStudySaved ? <UnsaveIcon /> : <SaveIcon />}
              text={isStudySaved ? 'Unsave study' : 'Save study'}
              onClick={handleSaveStudy}
            />
            <StudyContact title="Sponsor" contact={entry.sponsor} />
            {entry.contacts.map((contact, index) => (
              <StudyContact title="Contact" contact={contact} key={index} />
            ))}
            {closestFacilities.length !== 0 && (
              <Accordion disableGutters square sx={{ marginTop: 2 }} className="borderless">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`study-${entry.trialId}-content`}
                  id={`study-${entry.trialId}-header`}
                >
                  <Typography fontWeight="700" sx={{ textTransform: 'uppercase' }}>
                    Closest Facilities
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ boxShadow: 'inset 0px 1px 0px 0px rgb(0 0 0 / 20%)' }}>
                  {closestFacilities.map((closestFacility, index) => (
                    <StudyContact title={`Facility ${index + 1}`} contact={closestFacility} key={index} />
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default memo(
  Study,
  (prevProps: StudyProps, nextProps: StudyProps) => prevProps.isStudySaved === nextProps.isStudySaved
);
