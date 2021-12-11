import { GeolibInputCoordinates } from 'geolib/es/types';
import data from 'us-zips';
import { findNearest, convertDistance, getPreciseDistance, getLatitude, getLongitude } from 'geolib';
import { Location, Reference, ResearchStudy } from 'fhir/r4';

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

export const getLocations = (study: ResearchStudy): Location[] => {
  const sites: Reference[] = study.site || [];
  const locations: Location[] = [];
  const getLocation = (referenceId: string) =>
    study.contained.find(({ resourceType, id }) => resourceType === 'Location' && referenceId === id);

  for (const site of sites) {
    const url: string = site.reference;
    const isLocalReference = url.length > 1 && url.substr(0, 1);
    if (isLocalReference) {
      const id = url.substr(1);
      const location = getLocation(id) as Location;
      location && locations.push(location);
    }
  }
  return locations;
};

export const getLocationsWithCoordinates = (study: ResearchStudy): Location[] => {
  const locations = getLocations(study);
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
