import { Location, Reference, ResearchStudy } from 'fhir/r4';
import { convertDistance, getLatitude, getLongitude, getPreciseDistance } from 'geolib';
import { GeolibInputCoordinates } from 'geolib/es/types';
import data from 'us-zips';

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
  const getLocation = (referenceId: string) =>
    study.contained.find(({ resourceType, id }) => resourceType === 'Location' && referenceId === id);

  for (const site of sites) {
    const url: string = site.reference;
    // FIXME: What is "url.substring(0, 1)" trying to check?
    // Is it supposed to be url[0] === '#'?
    const isLocalReference = url.length > 1 && url.substring(0, 1);
    if (isLocalReference) {
      const id = url.substring(1);
      const location = getLocation(id) as Location;
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
