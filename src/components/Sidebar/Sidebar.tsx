import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { FilterAlt as FilterIcon, Search as SearchIcon } from '@mui/icons-material';

import SidebarAccordion from './SidebarAccordion';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { Patient } from '@/utils/fhirConversionUtils';
import FilterForm, { FilterFormValuesType } from '@/components/FilterForm';
import { formDataToFilterQuery } from '../FilterForm/FilterForm';
import { formDataToSearchQuery } from '../SearchForm/SearchForm';
import { SavedStudiesState } from '../Results';
import { FullSearchParameters } from 'types/search-types';
import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';

type SidebarProps = {
  patient: Patient;
  disabled: boolean;
  savedStudies: SavedStudiesState;
  filterOptions: FilterOptions;
};

export const ensureArray = (value?: string | string[]): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const Sidebar = ({ patient, disabled, savedStudies, filterOptions }: SidebarProps): ReactElement => {
  const { query } = useRouter();

  const matchingServices = query.matchingServices || [];
  const defaultSearchValues = {
    matchingServices: {
      breastCancerTrials: matchingServices.includes('breastCancerTrials'),
      trialjectory: matchingServices.includes('trialjectory'),
      trialscope: matchingServices.includes('trialscope'),
    },
    zipcode: (query.zipcode as string) || '',
    travelDistance: (query.travelDistance as string) || '',
    age: (query.age as string) || '',
    gender: (query.gender as string) || '',
    cancerType: null, // TODO: Pull out of query
    cancerSubtype: null, // TODO: Pull out of query
    metastasis: ensureArray(query.metastasis),
    stage: (query.stage as string) || null,
    ecogScore: (query.ecogScore as string) || null,
    karnofskyScore: (query.karnofskyScore as string) || null,
    biomarkers: ensureArray(query.biomarkers),
    radiation: ensureArray(query.radiation),
    surgery: ensureArray(query.surgery),
    medications: ensureArray(query.medications),
  };

  const sortingOption = query.sortingOption as FilterFormValuesType['sortingOption'];
  const recruitmentStatus = ensureArray(query.recruitmentStatus);
  const trialPhase = ensureArray(query.trialPhase);
  const studyType = ensureArray(query.studyType);

  const defaultFilterValues: FilterFormValuesType = {
    sortingOption,
    filterOptions: {
      recruitmentStatus: Object.fromEntries(recruitmentStatus.map(key => [key, true])),
      trialPhase: Object.fromEntries(trialPhase.map(key => [key, true])),
      studyType: Object.fromEntries(studyType.map(key => [key, true])),
    },
  };

  const blankFilterValues: FilterFormValuesType = {
    sortingOption: 'matchLikelihood',
    filterOptions: {
      recruitmentStatus: Object.fromEntries(recruitmentStatus.map(key => [key, false])),
      trialPhase: Object.fromEntries(trialPhase.map(key => [key, false])),
      studyType: Object.fromEntries(studyType.map(key => [key, false])),
    },
  };

  const fullSearchParams: FullSearchParameters = {
    ...formDataToSearchQuery(defaultSearchValues),
    ...formDataToFilterQuery(defaultFilterValues),
    savedStudies: Array.from(savedStudies),
  };

  return (
    <>
      <PatientCard patient={patient} />

      <SidebarAccordion icon={<SearchIcon fontSize="large" />} title="New Search" disabled={disabled}>
        <SearchForm fullWidth defaultValues={defaultSearchValues} fullSearchParams={fullSearchParams} />
      </SidebarAccordion>

      <SidebarAccordion defaultExpanded icon={<FilterIcon fontSize="large" />} title="Filters" disabled={disabled}>
        <FilterForm
          fullWidth
          defaultValues={defaultFilterValues}
          blankValues={blankFilterValues}
          fullSearchParams={fullSearchParams}
          filterOptions={filterOptions}
          disabled={disabled}
        />
      </SidebarAccordion>
    </>
  );
};

export default Sidebar;
