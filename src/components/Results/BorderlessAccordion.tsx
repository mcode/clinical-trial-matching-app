import { Accordion, AccordionProps, AccordionSummary, AccordionSummaryProps } from '@mui/material';
import styled from '@emotion/styled';

export const BorderlessAccordion = styled(Accordion)<AccordionProps>(({}) => ({
  '&.MuiAccordion-root': { boxShadow: 'none', backgroundColor: 'unset' },
  '&.MuiAccordion-root:before': { backgroundColor: 'unset' },
}));

export const BorderlessAccordionSummary = styled(AccordionSummary)<AccordionSummaryProps>(({}) => ({
  '&.MuiAccordionSummary-root': { margin: 0, flexDirection: 'row' },
  '& .MuiAccordionSummary-content': { margin: 0, overflowWrap: 'break-word' },
}));
