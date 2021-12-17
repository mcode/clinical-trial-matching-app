import mockCancerCodes from './mockData/cancerCodes.json';
import type { NamedSNOMEDCode } from '@/utils/fhirConversionUtils';

const fetchCancerCodesQuery = async (): Promise<NamedSNOMEDCode[]> => mockCancerCodes.types;

export default fetchCancerCodesQuery;
