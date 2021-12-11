import { Location, ResearchStudy } from 'fhir/r4';

export const locationsWithAndWithoutCoordinates: Location[] = [
  {
    resourceType: 'Location',
    id: 'location-1',
    name: 'First Location',
    position: {
      latitude: 13.5,
      longitude: 37.7,
    },
  },
  {
    resourceType: 'Location',
    id: 'location-2',
    name: 'Second Location',
    telecom: [
      {
        system: 'email',
        value: 'email@example.com',
        use: 'work',
      },
    ],
  },
  {
    resourceType: 'Location',
    id: 'location-3',
    name: 'Third Location',
    address: {
      postalCode: '00000',
      country: 'USA',
    },
  },
  {
    resourceType: 'Location',
    id: 'location-4',
    name: 'Fourth Location',
    address: {
      postalCode: '22102',
      country: 'USA',
    },
  },
  {
    resourceType: 'Location',
    id: 'location-5',
    name: 'Fifth Location (does not have local reference)',
    address: {
      postalCode: '70001',
      country: 'USA',
    },
  },
];

export const researchStudyWithLocations: ResearchStudy = {
  resourceType: 'ResearchStudy',
  site: [
    {
      reference: '#location-1',
      type: 'Location',
    },
    {
      reference: '#location-2',
      type: 'Location',
    },
    {
      reference: '#location-3',
      type: 'Location',
    },
    {
      reference: '#location-4',
      type: 'Location',
    },
  ],
  contained: [
    {
      resourceType: 'Organization',
    },
    {
      resourceType: 'PlanDefinition',
      status: 'unknown',
    },
    ...locationsWithAndWithoutCoordinates,
  ],
  status: 'closed-to-accrual',
};
