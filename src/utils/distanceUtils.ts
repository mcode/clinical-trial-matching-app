import { GeolibInputCoordinates } from 'geolib/es/types';
import data from 'us-zips';
import { findNearest, convertDistance, getPreciseDistance, getLatitude, getLongitude } from 'geolib';
import { DomainResource, FhirResource, Location } from 'fhir/r4';

export const getZipcodeCoordinates = (zipcode: string): GeolibInputCoordinates => {
  return data[zipcode] || null;
};

export const getCoordinatesOfClosestLocation = (
  origin: GeolibInputCoordinates,
  locations: Location[]
): GeolibInputCoordinates => {
  const allCoordinates = locations
    .map(getLocationCoordinates)
    .filter(coordinates => coordinates && getLongitude(coordinates) && getLatitude(coordinates));
  return origin && allCoordinates.length !== 0 ? findNearest(origin, allCoordinates) : null;
};

export const getDistanceBetweenPoints = (
  coordinates: GeolibInputCoordinates,
  origin: GeolibInputCoordinates
): number => {
  return coordinates && origin
    ? Math.round(100 * convertDistance(getPreciseDistance(origin, coordinates), 'mi')) / 100
    : null;
};

export const getLocationCoordinates = (location: Location): GeolibInputCoordinates => {
  const { position } = { ...location };
  const { longitude, latitude } = { ...position };
  return longitude && latitude
    ? {
        longitude,
        latitude,
      }
    : null;
};

export const getLocationsWithCoordinates = (study: DomainResource): Location[] => {
  const isLocation = ({ resourceType }: FhirResource) => resourceType === 'Location';
  const locations: Location[] = (study?.contained?.filter(isLocation) as Location[]) || [];
  const united_states = new RegExp(/(United States|United States of America|USA|US)/, 'i');
  const us_zip = new RegExp(/^\d{5}$/);
  const locationsWithCoordinates: Location[] = [];

  for (const location of locations) {
    const { position, address } = { ...location };
    const { longitude, latitude } = { ...position };
    const { postalCode, country } = { ...address };
    if (longitude && latitude) {
      locationsWithCoordinates.push(location);
    } else if (postalCode && country) {
      const isCountryUS = united_states.test(country);
      const isZipcodeFromUS = us_zip.test(postalCode);
      if (isCountryUS && isZipcodeFromUS) {
        const coordinates = getZipcodeCoordinates(postalCode);
        if (coordinates) {
          const longitude = getLongitude(coordinates);
          const latitude = getLatitude(coordinates);
          locationsWithCoordinates.push({ ...location, position: { latitude, longitude } });
        }
      }
    }
  }

  return locationsWithCoordinates;
};

export const coordinatesAreEqual =
  (first: GeolibInputCoordinates) =>
  (location: Location): boolean => {
    if (!(first && location)) return false;
    const second = getLocationCoordinates(location);
    return second && getLongitude(first) === getLongitude(second) && getLatitude(first) === getLatitude(second);
  };
