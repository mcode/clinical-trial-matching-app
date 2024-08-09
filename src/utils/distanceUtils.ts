import { Location, Reference, ResearchStudy } from 'fhir/r4';
import { convertDistance, getLatitude, getLongitude, getPreciseDistance } from 'geolib';
import { GeolibInputCoordinates } from 'geolib/es/types';
import data from 'us-zips';
import { findContainedResourceById } from './fhirUtils';

export const getZipcodeCoordinates = (zipcode: string): GeolibInputCoordinates => {
  return data[zipcode] || null;
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

  for (const site of sites) {
    const url: string = site.reference;
    // If the URL is a local reference, find it
    if (url.startsWith('#')) {
      const location = findContainedResourceById<Location>(study, 'Location', url.substring(1));
      location && locations.push(location);
    }
  }
  return locations;
};

export const getCoordinatesForLocations = (locations: Location[]): Location[] => {
  const locationsWithCoordinates: Location[] = [];

  for (const location of locations) {
    const { position, address } = { ...location };
    const { longitude, latitude } = { ...position };
    const { postalCode } = { ...address };
    if (longitude && latitude) {
      locationsWithCoordinates.push(location);
    } else if (postalCode) {
      const coordinates = getZipcodeCoordinates(postalCode);
      if (coordinates) {
        const longitude = getLongitude(coordinates);
        const latitude = getLatitude(coordinates);
        locationsWithCoordinates.push({ ...location, position: { latitude, longitude } });
      }
    }
  }

  return locationsWithCoordinates;
};
