import { SNOMED_CODE_URI } from '@/utils/fhirConstants';
import { CancerType } from '@/utils/fhirConversionUtils';
import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import SearchForm, { compareDefaultValues, SearchFormProps } from '../SearchForm';
import { SearchFormValuesType } from '../types';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const defaultValues: Partial<SearchFormValuesType> = {
  age: '28',
  cancerType: {
    category: ['Breast'],
    cancerType: [CancerType.BREAST],
    entryType: 'cancerType',
    display: 'Primary malignant neoplasm of breast',
    code: '372137005',
    system: SNOMED_CODE_URI,
  },
  travelDistance: '100',
  zipcode: '11111',
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: Infinity,
      },
    },
  });

describe('<SearchForm />', () => {
  const Component = (props: Partial<SearchFormProps>) => (
    <QueryClientProvider client={createQueryClient()}>
      <SearchForm
        defaultValues={defaultValues}
        setUserId={() => {
          // No-op
        }}
        {...props}
      />
    </QueryClientProvider>
  );

  it('renders the search form and all the search form fields', () => {
    act(() => {
      render(<Component />);
    });

    expect(screen.getByText(/let's find some clinical trials/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('matchingServices')).toHaveLength(2);
    expect(screen.getByTestId('zipcode')).toBeInTheDocument();
    expect(screen.getByTestId('travelDistance')).toBeInTheDocument();
    expect(screen.getByTestId('age')).toBeInTheDocument();
    expect(screen.getByTestId('cancerType')).toBeInTheDocument();
    expect(screen.getByTestId('cancerSubtype')).toBeInTheDocument();
    expect(screen.getByTestId('metastasis')).toBeInTheDocument();
    expect(screen.getByTestId('stage')).toBeInTheDocument();
    expect(screen.getByTestId('ecogScore')).toBeInTheDocument();
    expect(screen.getByTestId('karnofskyScore')).toBeInTheDocument();
    expect(screen.getByTestId('biomarkers')).toBeInTheDocument();
    expect(screen.getByTestId('radiation')).toBeInTheDocument();
    expect(screen.getByTestId('surgery')).toBeInTheDocument();
    expect(screen.getByTestId('medications')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('autopopulates with default or patient data', () => {
    act(() => {
      render(<Component />);
    });

    expect(screen.getByTestId('zipcode')).toContainHTML('11111');
    expect(screen.getByTestId('travelDistance')).toContainHTML('100');
    expect(screen.getByTestId('age')).toContainHTML('28');
    expect(screen.getByTestId('cancerType')).toContainHTML(CancerType.BREAST);
    expect(screen.getByTestId('cancerType')).toContainHTML('Primary malignant neoplasm of breast');
  });

  // TODO: This component may require additional testing given how the state changes
  // based on the selected cancer type.
});

describe('compareDefaultValues', () => {
  it('returns the list of altered default values', () => {
    expect(
      compareDefaultValues(defaultValues, {
        userid: '',
        matchingServices: {},
        zipcode: '12345',
        travelDistance: '100',
        age: '28',
        gender: 'male',
        cancerType: undefined,
        cancerSubtype: undefined,
        diseaseStatus: undefined,
        metastasis: [],
        stage: undefined,
        ecogScore: {
          entryType: 'ecogScore',
          interpretation: {
            code: 'LA9623-5',
            display:
              'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work',
            system: 'http://loinc.org',
          },
          valueInteger: 1,
        },
        karnofskyScore: {
          interpretation: {
            display: 'Able to carry on normal activity; minor signs or symptoms of disease',
            code: 'LA29176-7',
            system: 'http://loinc.org',
          },
          valueInteger: 90,
          entryType: 'karnofskyScore',
        },
        biomarkers: [],
        radiation: [],
        surgery: [
          {
            entryType: 'surgery',
            cancerType: [CancerType.BREAST],
            code: '234262008',
            display: 'Excision of axillary lymph node (procedure)',
            system: 'http://snomed.info/sct',
            category: ['Alnd'],
          },
        ],
        medications: [],
      })
    ).toEqual({
      age: false,
      gender: true,
      ecogScore: true,
      karnofskyScore: true,
      matchingServices: false,
      'surgerysurgerybreast234262008Excision of axillary lymph node (procedure)http://snomed.info/sctAlnd': true,
      travelDistance: false,
      userid: true,
      zipcode: true,
    });
  });
});
