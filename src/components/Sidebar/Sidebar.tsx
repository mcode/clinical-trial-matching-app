import FilterForm, { FilterFormValuesType } from '@/components/FilterForm';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { DEFAULT_PAGE } from '@/queries/clinicalTrialPaginationQuery';
import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { CodedValueType, parseCodedValue, parseCodedValueArray, Patient } from '@/utils/fhirConversionUtils';
import { FilterAlt as FilterIcon, Search as SearchIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ReactElement, SyntheticEvent, useState } from 'react';
import { FullSearchParameters } from 'types/search-types';
import { formDataToFilterQuery } from '../FilterForm/FilterForm';
import { SavedStudiesState } from '../Results';
import { formDataToSearchQuery } from '../SearchForm/SearchForm';
import SidebarAccordion from './SidebarAccordion';

type SidebarProps = {
  patient: Patient;
  disabled: boolean;
  savedStudies: SavedStudiesState;
  filterOptions: FilterOptions;
};

enum SidebarExpand {
  Neither = 0,
  Search,
  Filter,
}

export const ensureArray = (value?: string | string[]): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const ensureCodedValueType = (value?: string): CodedValueType => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    // For now, take the first value, if anys
    return value.length >= 1 ? parseCodedValue(value[0]) : undefined;
  } else {
    return parseCodedValue(value);
  }
};

const Sidebar = ({ patient, disabled, savedStudies, filterOptions }: SidebarProps): ReactElement => {
  const { query } = useRouter();
  const [expanded, setExpanded] = useState<SidebarExpand>(SidebarExpand.Filter);

  const handleChange = (panel: SidebarExpand) => (_event: SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : SidebarExpand.Neither);
  };
  console.log('Query=', query);
  const matchingServices = ensureArray(query.matchingServices);
  const defaultSearchValues = {
    matchingServices: Object.fromEntries(matchingServices.map(key => [key, true])),
    zipcode: (query.zipcode as string) || '',
    travelDistance: (query.travelDistance as string) || '',
    age: (query.age as string) || '',
    gender: (query.gender as string) || '',
    cancerType: ensureCodedValueType(query.cancerType as string),
    cancerSubtype: ensureCodedValueType(query.cancerSubtype as string),
    metastasis: ensureArray(query.metastasis),
    //stage: (query.stage as string) || null,
    stage: ensureCodedValueType(query.stage as string),
    ecogScore: (query.ecogScore as string) || null,
    karnofskyScore: (query.karnofskyScore as string) || null,
    biomarkers: parseCodedValueArray(query.biomarkers as string),
    radiation: parseCodedValueArray(query.radiation as string),
    surgery: parseCodedValueArray(query.surgery as string),
    medications: parseCodedValueArray(query.medications as string),
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
    page: DEFAULT_PAGE,
    pageSize: query.pageSize as string,
  };

  return (
    <>
      <PatientCard patient={patient} />

      <SidebarAccordion
        icon={<SearchIcon fontSize="large" />}
        title="New Search"
        disabled={disabled}
        expanded={expanded === SidebarExpand.Search}
        onChange={handleChange(SidebarExpand.Search)}
      >
        <SearchForm fullWidth defaultValues={defaultSearchValues} />
      </SidebarAccordion>

      <SidebarAccordion
        icon={<FilterIcon fontSize="large" />}
        title="Filters"
        disabled={disabled}
        expanded={expanded === SidebarExpand.Filter}
        onChange={handleChange(SidebarExpand.Filter)}
      >
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
