import { fhirclient } from 'fhirclient/lib/types';

const getEcogScore = (answerId: string): string => {
  let score;
  switch (answerId) {
    case 'LA9622-7':
      score = '0';
      break;
    case 'LA9623-5':
      score = '1';
      break;
    case 'LA9624-3':
      score = '2';
      break;
    case 'LA9625-0':
      score = '3';
      break;
    case 'LA9626-8':
      score = '4';
      break;
    case 'LA9627-6':
      score = '5';
      break;
    default:
      score = '';
      break;
  }
  return score;
};

export const convertFhirEcogPerformanceStatus = (bundle: fhirclient.FHIR.Bundle): string => {
  const answerId =
    bundle.entry &&
    bundle.entry[0] &&
    bundle.entry[0].resource &&
    bundle.entry[0].resource.interpretation &&
    bundle.entry[0].resource.interpretation[0] &&
    bundle.entry[0].resource.interpretation[0].coding &&
    bundle.entry[0].resource.interpretation[0].coding[0] &&
    bundle.entry[0].resource.interpretation[0].coding[0].code;
  return answerId ? getEcogScore(answerId) : null;
};
