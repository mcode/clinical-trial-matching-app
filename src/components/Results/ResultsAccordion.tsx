import { ReactElement, ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
  Grid,
  Stack,
  Chip,
  TableContainer,
  Table,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Event as EventIcon,
  TrackChanges as TrackChangesIcon,
} from '@mui/icons-material';
import { BundleEntry, ResearchStudy } from 'fhir/r4';
import { MatchIndicator, ValidColor, StudyDetail } from './types';
import { fontSize } from '@mui/system';

type ResultsAccordionProps = {
  entry: BundleEntry;
  index: number;
};

const getStatusColor = (status: ResearchStudy['status']): ValidColor => {
  const colorToStatusMap: Record<ValidColor, ResearchStudy['status'][]> = {
    'common.green': ['active', 'administratively-completed', 'approved', 'completed'],
    'common.yellow': ['in-review'],
    'common.red': [
      'closed-to-accrual',
      'closed-to-accrual-and-intervention',
      'disapproved',
      'temporarily-closed-to-accrual',
      'temporarily-closed-to-accrual-and-intervention',
      'withdrawn',
    ],
  };
  const colors: ValidColor[] = ['common.green', 'common.yellow', 'common.red'];
  return colors.find((color: ValidColor) => colorToStatusMap[color].includes(status));
};

const getMatchIndicator = (score: number): MatchIndicator => {
  if (score >= 0.75 && score <= 1) {
    return { text: 'High-likelihood match', color: 'common.green' };
  } else if (score >= 0.01 && score <= 0.74) {
    return { text: 'Possible match', color: 'common.yellow' };
  } else if (score === 0) {
    return { text: 'No match', color: 'common.red' };
  }
  return { text: 'Unknown likelihood', color: 'common.grayLight' };
};

const CustomButton = ({ children }: { children: ReactNode }): ReactElement => (
  <Button
    sx={{
      borderRadius: '0',
      color: 'common.white',
      float: 'right',
      fontSize: '1.3em',
      fontWeight: '500',
      height: '50px',
      minWidth: '200px',
      width: '100%',
    }}
    type="submit"
    variant="contained"
  >
    {children}
  </Button>
);

const getStudyDetails = (study: ResearchStudy): StudyDetail[] => {
  const details = [];

  const conditions = study.condition.map(({ text }) => text);
  conditions.length !== 0 && details.push({ header: 'Conditions', body: conditions.join(', ') });

  const trialId = study.identifier && study.identifier[0] && study.identifier[0].value;
  trialId && details.push({ header: 'Trial Id', body: trialId });

  // placeholder value
  const source = 'Unknown';
  source && details.push({ header: 'Source', body: source });

  const description = study.description;
  description && details.push({ header: 'Description', body: description });

  const enrollment = study.enrollment && study.enrollment[0] && study.enrollment[0].display;
  enrollment && details.push({ header: 'Eligibility', body: enrollment });

  return details;
};

const ResultsAccordion = ({ entry, index }: ResultsAccordionProps): ReactElement => {
  const study = entry.resource as ResearchStudy;
  const conditions = study.condition.map(({ text }) => text);
  const phase = study.phase.text;
  const studyType = study.category
    .map(entry => entry.text)
    .find(text => text.match(/Study Type: (.*)$/))
    .match(/observational|interventional/i)[0];
  const keywords = study.keyword.map(concept => concept.text.replaceAll(/_/g, ' '));

  const status = study.status.replaceAll(/-/g, ' ');
  const title = study.title;

  // should keywords be included?
  // there are no fields that indicate whether study is interventional/observational
  const labels = [...conditions, phase, studyType];

  const { query } = useRouter();

  // placeholder values
  const score = entry.search.score || 1;
  const matchIndicator = getMatchIndicator(score);
  const distance = '82.1 miles';
  const period = study.period || 'Feb 23, 2017 - Jan 2023';

  const statusColor = getStatusColor(study.status);

  const details = getStudyDetails(study);

  const nonExpandedStyle = {
    text: 'common.gray',
    background: 'common.grayLighter',
    chipText: 'common.grayLighter',
    chipBackground: 'common.grayLight',
  };
  const expandedStyle = {
    text: 'common.white',
    background: 'common.gray',
    chipText: 'common.gray',
    chipBackground: 'common.white',
  };
  const [accordionStyles, setAccordionStyles] = useState(nonExpandedStyle);

  return (
    <Accordion
      disableGutters
      square
      key={`${index}`}
      sx={{ marginBottom: 2 }}
      onChange={(event, expanded) => {
        expanded ? setAccordionStyles(expandedStyle) : setAccordionStyles(nonExpandedStyle);
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon fontSize="large" sx={{ color: accordionStyles.text, marginX: 2 }} />}
        aria-controls={`results-accordion-content-${index}`}
        id={`results-accordion-header-${index}`}
        sx={{
          color: accordionStyles.text,
          backgroundColor: accordionStyles.background,
          p: 0,
          '& .MuiAccordionSummary-content': {
            m: 0,
          },
        }}
      >
        <Grid container columns={12}>
          <Grid
            item
            container
            xs={12}
            sm={12}
            md={2}
            lg={2}
            xl={1}
            py={1}
            alignItems="center"
            justifyContent="center"
            bgcolor={statusColor}
          >
            <Typography sx={{ textTransform: 'uppercase' }} textAlign="center" color="common.white" fontWeight="600">
              {status}
            </Typography>
          </Grid>

          <Grid
            item
            container
            xs={12}
            sm={12}
            md={6}
            lg={6}
            xl={7}
            pl={3}
            py={1}
            direction="column"
            justifyContent="space-evenly"
          >
            <Typography fontWeight="normal" variant="h6" lineHeight={1}>
              {title}
            </Typography>
            <Stack display="flex" alignItems="center" direction="row" flexWrap="wrap">
              {labels.map(
                (label: string, index: number): JSX.Element => (
                  <Chip
                    key={index}
                    label={label}
                    sx={{
                      textTransform: 'uppercase',
                      color: accordionStyles.chipText,
                      backgroundColor: accordionStyles.chipBackground,
                      fontWeight: '600',
                      marginTop: 1,
                      marginRight: 1,
                    }}
                    size="small"
                  />
                )
              )}
            </Stack>
          </Grid>

          <Grid
            item
            container
            xs={9}
            sm={9}
            md={3}
            lg={3}
            xl={3}
            pl={3}
            py={1}
            direction="column"
            justifyContent="space-evenly"
          >
            <Stack alignItems="center" direction="row" spacing={1}>
              <TrackChangesIcon fontSize="medium" sx={{ color: matchIndicator.color }} />
              <Typography>{matchIndicator.text}</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1} mt={1}>
              <LocationOnIcon fontSize="medium" sx={{ color: accordionStyles.text }} />
              <Typography>{distance}</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1} mt={1}>
              <EventIcon fontSize="medium" sx={{ color: accordionStyles.text }} />
              <Typography>{period}</Typography>
            </Stack>
          </Grid>

          <Grid item container xs={3} sm={3} md={1} lg={1} xl={1} py={1} alignItems="center" justifyContent="center">
            <SaveIcon fontSize="large" sx={{ color: 'common.blue', marginLeft: { sm: 'inherit', md: 'auto' } }} />
          </Grid>
        </Grid>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0, border: `5px solid ${accordionStyles.background}` }}>
        <Grid container columns={12}>
          <Grid item xl={9} p={2} sx={{ backgroundColor: 'common.white' }}>
            <TableContainer>
              <Table>
                {details.map(({ header, body }) => (
                  <TableRow>
                    <TableCell
                      variant="head"
                      sx={{
                        textTransform: 'uppercase',
                        textAlign: 'right',
                      }}
                    >
                      {header}
                    </TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {body}
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xl={3} p={2} sx={{ backgroundColor: 'common.grayLighter' }}>
            <CustomButton>
              <SaveIcon sx={{ paddingRight: '5px' }} /> More info
            </CustomButton>
            <CustomButton>
              <SaveIcon sx={{ paddingRight: '5px' }} /> Save study
            </CustomButton>
            <Stack></Stack>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default ResultsAccordion;
