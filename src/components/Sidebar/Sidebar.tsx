import FilterForm, { FilterFormValuesType } from '@/components/FilterForm';
import PatientCard from '@/components/PatientCard';
import SearchForm from '@/components/SearchForm';
import { DEFAULT_PAGE } from '@/queries/clinicalTrialPaginationQuery';
import { FilterOptions } from '@/queries/clinicalTrialSearchQuery';
import { Patient } from '@/utils/fhirConversionUtils';
import { FilterAlt as FilterIcon, Search as SearchIcon } from '@mui/icons-material';
import { ParsedUrlQuery } from 'querystring';
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
  setUserId: (string) => void;
  query: ParsedUrlQuery;
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

const Sidebar = ({ patient, disabled, savedStudies, filterOptions, query, setUserId }: SidebarProps): ReactElement => {
  const [expanded, setExpanded] = useState<SidebarExpand>(SidebarExpand.Filter);

  const handleChange = (panel: SidebarExpand) => (_event: SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : SidebarExpand.Neither);
  };

  const matchingServices = ensureArray(query.matchingServices);
  const defaultSearchValues = {
    userid: null,
    matchingServices: Object.fromEntries(matchingServices.map(key => [key, true])),
    zipcode: (query.zipcode as string) || '',
    travelDistance: (query.travelDistance as string) || '',
    age: (query.age as string) || '',
    gender: (query.gender as string) || '',
    cancerType: query.cancerType ? JSON.parse(query.cancerType as string) : null,
    cancerSubtype: query.cancerSubtype ? JSON.parse(query.cancerSubtype as string) : null,
    diseaseStatus: query.diseaseStatus ? JSON.parse(query.diseaseStatus as string) : null,
    metastasis: query.metastasis ? JSON.parse(query.metastasis as string) : null,
    stage: query.stage ? JSON.parse(query.stage as string) : null,
    ecogScore: query.ecogScore ? JSON.parse(query.ecogScore as string) : null,
    karnofskyScore: query.karnofskyScore ? JSON.parse(query.karnofskyScore as string) : null,
    biomarkers: query.biomarkers ? JSON.parse(query.biomarkers as string) : null,
    radiation: query.radiation ? JSON.parse(query.radiation as string) : null,
    surgery: query.surgery ? JSON.parse(query.surgery as string) : null,
    medications: query.medications ? JSON.parse(query.medications as string) : null,
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
        <SearchForm fullWidth defaultValues={defaultSearchValues} setUserId={setUserId} />
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
