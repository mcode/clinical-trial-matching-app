import type { ReactElement } from 'react';
import {
  AccordionActions,
  AccordionSummary,
  Box,
  Chip,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import {
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationOnIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

import TargetIcon from '@/assets/images/target.svg';
import { StudyProps } from './types';

type StudyHeaderProps = {
  isExpanded: boolean;
  studyId: string;
  studyProps: StudyProps;
};

const StudyHeader = ({ isExpanded, studyId, studyProps }: StudyHeaderProps): ReactElement => {
  const studyTags = [...(studyProps.conditions || []), studyProps.phase, studyProps.type];
  const theme = useTheme();
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AccordionSummary
      aria-controls={`results-content-${studyId}`}
      expandIcon={
        <IconButton aria-label="expand collapse">
          <ExpandMoreIcon fontSize="large" sx={{ color: isExpanded ? 'common.white' : 'common.gray', mx: 0 }} />
        </IconButton>
      }
      id={`results-header-${studyId}`}
      sx={{
        backgroundColor: isExpanded ? 'common.gray' : 'common.grayLighter',
        color: isExpanded ? 'common.white' : 'common.gray',
        p: 0,
        '& .MuiAccordionSummary-content': { m: 0, flexDirection: { xs: 'column', sm: 'row' } },
      }}
    >
      <Stack direction={{ xs: 'column', lg: 'row' }} flexGrow={1} spacing={{ xs: 0, lg: 4 }}>
        <Box
          alignItems="center"
          bgcolor={studyProps.status.color}
          display={{ xs: 'block', lg: 'flex' }}
          height="100%"
          justifyContent="center"
          minHeight={{ lg: '100px' }}
          minWidth="110px"
          p={1}
          width={{ xs: 'fit-content', lg: '110px' }}
        >
          <Typography color="common.white" fontWeight="600" sx={{ textTransform: 'uppercase' }} textAlign="center">
            {studyProps.status.text}
          </Typography>
        </Box>

        <Stack
          alignItems="center"
          direction={{ xs: 'column', xl: 'row' }}
          flexGrow={1}
          height="100%"
          p={2}
          spacing={{ xs: 0, xl: 4 }}
        >
          <Stack alignSelf={{ xs: 'flex-start', xl: 'center' }} flexGrow={1}>
            <Typography fontWeight="normal" lineHeight={1.2} mb={0.5} variant="h6">
              {studyProps.title}
            </Typography>

            <Stack alignItems="center" direction="row" flexWrap="wrap">
              {studyTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    backgroundColor: isExpanded ? 'common.white' : 'common.grayLight',
                    color: isExpanded ? 'common.gray' : 'common.grayLighter',
                    fontWeight: '600',
                    marginRight: 1,
                    marginTop: 0.5,
                    textTransform: 'uppercase',
                  }}
                  size="small"
                />
              ))}
            </Stack>
          </Stack>

          <Stack alignSelf={{ xs: 'flex-start', xl: 'center' }} py={1} spacing={{ xs: 0, xl: 0.5 }}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <SvgIcon
                component={TargetIcon}
                fontSize="inherit"
                sx={{ color: studyProps.likelihood.color, width: '20px' }}
              />
              <Typography whiteSpace="nowrap">{studyProps.likelihood.text}</Typography>
            </Stack>

            <Stack alignItems="center" direction="row" spacing={1}>
              <LocationOnIcon fontSize="small" sx={{ color: isExpanded ? 'common.white' : 'common.gray' }} />
              <Typography>{studyProps.distance}</Typography>
            </Stack>

            {studyProps.period && (
              <Stack alignItems="center" direction="row" spacing={1}>
                <EventIcon fontSize="small" sx={{ color: isExpanded ? 'common.white' : 'common.gray' }} />
                <Typography>{studyProps.period}</Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      <AccordionActions style={{ padding: ' 0 16px' }}>
        {isExtraSmallScreen ? (
          <Button
            startIcon={<SaveIcon />}
            sx={{
              fontSize: '1.1em',
              fontWeight: '600',
              minWidth: '200px',
              width: '100%',
            }}
            variant="contained"
          >
            Save study
          </Button>
        ) : (
          <IconButton aria-label="save study">
            <SaveIcon fontSize="medium" sx={{ color: 'common.blue', p: 0 }} />
          </IconButton>
        )}
      </AccordionActions>
    </AccordionSummary>
  );
};

export default StudyHeader;