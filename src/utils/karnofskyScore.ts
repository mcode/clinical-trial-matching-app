import { fhirclient } from 'fhirclient/lib/types';

const getKarnofskyScore = (answerId: string): string => {
  let score;
  switch (answerId) {
    case 'LA29175-9':
      score = '100';
      break;
    case 'LA29176-7':
      score = '90';
      break;
    case 'LA29177-5':
      score = '80';
      break;
    case 'LA29178-3':
      score = '70';
      break;
    case 'LA29179-1':
      score = '60';
      break;
    case 'LA29180-9':
      score = '50';
      break;
    case 'LA29181-7':
      score = '40';
      break;
    case 'LA29182-5':
      score = '30';
      break;
    case 'LA29183-3':
      score = '20';
      break;
    case 'LA29184-1':
      score = '10';
      break;
    case 'LA9627-6':
      score = '0';
      break;
    default:
      score = null;
      break;
  }
  return score;
};

export const convertFhirKarnofskyPerformanceStatus = (bundle: fhirclient.FHIR.Bundle): string => {
  const answerId =
    bundle.entry &&
    bundle.entry[0] &&
    bundle.entry[0].resource &&
    bundle.entry[0].resource.interpretation &&
    bundle.entry[0].resource.interpretation[0] &&
    bundle.entry[0].resource.interpretation[0].coding &&
    bundle.entry[0].resource.interpretation[0].coding[0] &&
    bundle.entry[0].resource.interpretation[0].coding[0].code;
  return getKarnofskyScore(answerId);
};
