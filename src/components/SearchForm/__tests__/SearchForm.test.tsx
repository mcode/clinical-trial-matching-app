import { SNOMED_CODE_URI } from '@/utils/fhirConstants';
import { CancerType } from '@/utils/fhirConversionUtils';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import SearchForm, { compareDefaultValues, SearchFormProps } from '../SearchForm';
import { SearchFormValuesType } from '../types';
import mockRouter from 'next-router-mock';

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
  afterEach(() => {
    cleanup();
  });
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
    render(<Component />);

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
    render(<Component />);

    expect(screen.getByTestId('zipcode')).toContainHTML('11111');
    expect(screen.getByTestId('travelDistance')).toContainHTML('100');
    expect(screen.getByTestId('age')).toContainHTML('28');
    expect(screen.getByTestId('cancerType')).toContainHTML(CancerType.BREAST);
    expect(screen.getByTestId('cancerType')).toContainHTML('Primary malignant neoplasm of breast');
  });

  it('disables the location fields when disableLocation is true', async () => {
    render(<Component disableLocation={true} />);
    expect(screen.getByTestId('travelDistance').querySelector('input')).toBeDisabled();
    expect(screen.getByTestId('zipcode').querySelector('input')).toBeDisabled();
  });

  it('does not disable the location fields when disableLocation is false', async () => {
    render(<Component disableLocation={false} />);
    expect(screen.getByTestId('travelDistance').querySelector('input')).toBeEnabled();
    expect(screen.getByTestId('zipcode').querySelector('input')).toBeEnabled();
  });

  it('when location is disabled sends default location data on submit', async () => {
    mockRouter.push('/search');
    render(<Component disableLocation={true} />);
    await userEvent.click(screen.getByText('Search'));
    expect(mockRouter).toMatchObject({
      pathname: '/results',
      query: {
        age: '28',
        cancerType:
          '{"category":["Breast"],"cancerType":["breast"],"entryType":"cancerType","display":"Primary malignant neoplasm of breast","code":"372137005","system":"http://snomed.info/sct"}',
        travelDistance: '100',
        zipcode: '11111',
        userid: null,
        matchingServices: [],
        cancerSubtype: undefined,
        ecogScore: undefined,
        karnofskyScore: undefined,
        stage: undefined,
        metastasis: '[]',
        biomarkers: '[]',
        radiation: '[]',
        surgery: '[]',
        medications: '[]',
        sortingOption: 'matchLikelihood',
        page: '1',
        pageSize: '15',
      },
    });
  });

  it('when location is enabled sends user set location data on submit', async () => {
    mockRouter.push('/search');
    render(<Component disableLocation={false} />);
    const travelDistance = screen.getByTestId('travelDistance').querySelector('input');
    await userEvent.clear(travelDistance);
    await userEvent.type(travelDistance, '222');
    const zipcode = screen.getByTestId('zipcode').querySelector('input');
    await userEvent.clear(zipcode);
    await userEvent.type(zipcode, '98765');
    await userEvent.click(screen.getByText('Search'));
    expect(mockRouter).toMatchObject({
      pathname: '/results',
      query: {
        age: '28',
        cancerType:
          '{"category":["Breast"],"cancerType":["breast"],"entryType":"cancerType","display":"Primary malignant neoplasm of breast","code":"372137005","system":"http://snomed.info/sct"}',
        travelDistance: '222',
        zipcode: '98765',
        userid: null,
        matchingServices: [],
        cancerSubtype: undefined,
        ecogScore: undefined,
        karnofskyScore: undefined,
        stage: undefined,
        metastasis: '[]',
        biomarkers: '[]',
        radiation: '[]',
        surgery: '[]',
        medications: '[]',
        sortingOption: 'matchLikelihood',
        page: '1',
        pageSize: '15',
      },
    });
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
