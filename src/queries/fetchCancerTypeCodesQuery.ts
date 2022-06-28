import type { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';
import mockCancerCodes from './mockData/cancerCodes.json';

const fetchCancerCodesQuery = async (): Promise<NamedSNOMEDCode[]> => mockCancerCodes.types;

export default fetchCancerCodesQuery;
