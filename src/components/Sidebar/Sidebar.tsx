import type { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { FilterAlt as FilterIcon, Search as SearchIcon } from '@mui/icons-material';

import SidebarAccordion from './SidebarAccordion';
import PatientCard from '@/components/PatientCard';
import SearchForm, { SearchFormValuesType } from '@/components/SearchForm';
import { NamedSNOMEDCode, Patient, parseNamedSNOMEDCode } from '@/utils/fhirConversionUtils';

type SidebarProps = {
  patient: Patient;
  disabled: boolean;
};

const ensureArray = (value?: string | string[]): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const ensureNamedSNOMEDCode = (value?: string | string[]): NamedSNOMEDCode => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    // For now, take the first value, if any
    return value.length >= 1 ? parseNamedSNOMEDCode(value[0]) : undefined;
  } else {
    return parseNamedSNOMEDCode(value);
  }
};

const Sidebar = ({ patient, disabled }: SidebarProps): ReactElement => {
  const { query } = useRouter();

  const matchingServices = query.matchingServices || [];
  const defaultValues: Partial<SearchFormValuesType> = {
    matchingServices: {
      breastCancerTrials: matchingServices.includes('breastCancerTrials'),
      trialjectory: matchingServices.includes('trialjectory'),
      trialscope: matchingServices.includes('trialscope'),
    },
    zipcode: (query.zipcode as string) || '',
    travelDistance: (query.travelDistance as string) || '',
    age: (query.age as string) || '',
    cancerType: ensureNamedSNOMEDCode(query.cancerType),
    cancerSubtype: ensureNamedSNOMEDCode(query.cancerSubtype),
    metastasis: ensureArray(query.metastasis),
    stage: (query.stage as string) || null,
    ecogScore: (query.ecogScore as string) || null,
    karnofskyScore: (query.karnofskyScore as string) || null,
    biomarkers: ensureArray(query.biomarkers),
    radiation: ensureArray(query.radiation),
    surgery: ensureArray(query.surgery),
    medications: ensureArray(query.medications),
  };

  return (
    <>
      <PatientCard patient={patient} />

      <SidebarAccordion icon={<SearchIcon fontSize="large" />} title="New Search" disabled={disabled}>
        <SearchForm fullWidth defaultValues={defaultValues} />
      </SidebarAccordion>

      <SidebarAccordion defaultExpanded icon={<FilterIcon fontSize="large" />} title="Filters" disabled={disabled}>
        <p>TODO: Filters</p>
      </SidebarAccordion>
    </>
  );
};

export default Sidebar;
