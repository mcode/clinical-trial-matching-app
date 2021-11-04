import type { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { FilterAlt as FilterIcon, Search as SearchIcon } from '@mui/icons-material';

import SidebarAccordion from './SidebarAccordion';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { Patient } from '@/utils/fhirConversionUtils';

type SidebarProps = {
  patient: Patient;
};

const ensureArray = (value?: string | string[]): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const Sidebar = ({ patient }: SidebarProps): ReactElement => {
  const { query } = useRouter();

  const matchingServices = query.matchingServices || [];
  const defaultValues = {
    matchingServices: {
      breastCancerTrials: matchingServices.includes('breastCancerTrials'),
      trialjectory: matchingServices.includes('trialjectory'),
      trialscope: matchingServices.includes('trialscope'),
    },
    zipcode: (query.zipcode as string) || '',
    travelDistance: (query.travelDistance as string) || '',
    age: (query.age as string) || '',
    cancerType: (query.cancerType as string) || '',
    cancerSubtype: (query.cancerSubtype as string) || '',
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

      <SidebarAccordion icon={<SearchIcon fontSize="large" />} title="New Search">
        <SearchForm fullWidth defaultValues={defaultValues} />
      </SidebarAccordion>

      <SidebarAccordion defaultExpanded icon={<FilterIcon fontSize="large" />} title="Filters">
        <p>TODO: Filters</p>
      </SidebarAccordion>
    </>
  );
};

export default Sidebar;
