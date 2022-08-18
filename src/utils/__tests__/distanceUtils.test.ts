import { locationsWithAndWithoutCoordinates, researchStudyWithLocations } from '@/__mocks__/testEntries';
import { GeolibInputCoordinates } from 'geolib/es/types';
import {
  getCoordinatesForLocations,
  getDistanceBetweenPoints,
  getLocationCoordinates,
  getLocations,
  getZipcodeCoordinates,
} from '../distanceUtils';

describe('getZipcodeCoordinates', () => {
  it('should get the coordinates for a zip code', () => {
    // Test with leading 0
    let point: GeolibInputCoordinates = getZipcodeCoordinates('01730');
    expect(point['latitude']).toBeCloseTo(42.49933, 5);
    expect(point['longitude']).toBeCloseTo(-71.2819, 5);

    // Test with all numbers
    point = getZipcodeCoordinates('22102');
    expect(point['latitude']).toBeCloseTo(38.95095, 5);
    expect(point['longitude']).toBeCloseTo(-77.22955, 5);
  });

  it('should return null when it cannot find the coordinates for a zip code', () => {
    const point: GeolibInputCoordinates = getZipcodeCoordinates('00000');
    expect(point).toBeNull();
  });
});

describe('getDistanceBetweenPoints', () => {
  it('should calculate the distance (miles) to the closest point', () => {
    const origin = { latitude: 42.499332, longitude: -71.281901 };
    const destination = { latitude: 38.950951, longitude: -77.229553 };
    expect(getDistanceBetweenPoints(origin, destination)).toBeCloseTo(396.61, 5);
  });
});

describe('getLocationCoordinates', () => {
  it('should get the coordinates for a location', () => {
    expect(getLocationCoordinates(locationsWithAndWithoutCoordinates[0])).toEqual({
      latitude: 13.5,
      longitude: 37.7,
    });
  });

  it('should return null when it cannot find the location coordinates', () => {
    expect(getLocationCoordinates(locationsWithAndWithoutCoordinates[1])).toBeNull();
  });
});

describe('getLocations', () => {
  it('should get all the locally referred locations contained within a ResearchStudy', () => {
    expect(getLocations(researchStudyWithLocations)).toEqual([
      locationsWithAndWithoutCoordinates[0],
      locationsWithAndWithoutCoordinates[1],
      locationsWithAndWithoutCoordinates[2],
      locationsWithAndWithoutCoordinates[3],
    ]);
  });
});

describe('getCoordinatesForLocations', () => {
  it('should get the coordinates for locations that have coordinates or zip codes that can be converted to coordinates', () => {
    expect(getCoordinatesForLocations(locationsWithAndWithoutCoordinates)).toEqual([
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
        id: 'location-4',
        name: 'Fourth Location',
        address: {
          postalCode: '22102',
          country: 'USA',
        },
        position: { latitude: 38.950951, longitude: -77.229553 },
      },
      {
        resourceType: 'Location',
        id: 'location-5',
        name: 'Fifth Location (does not have local reference)',
        address: {
          postalCode: '70001',
          country: 'USA',
        },
        position: {
          latitude: 29.982705,
          longitude: -90.169068,
        },
      },
    ]);
  });
});
