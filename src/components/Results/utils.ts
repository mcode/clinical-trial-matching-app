import { BundleEntrySearch, ContactDetail, Organization, ResearchStudy, Location } from 'fhir/r4';
import { format } from 'date-fns';
import { BundleEntry, ContactProps, LikelihoodProps, StatusProps, StudyDetail, StudyDetailProps } from './types';
import { MainRowKeys } from '@/utils/exportData';
import {
  getZipcodeCoordinates,
  getDistanceBetweenPoints,
  getLocations,
  getCoordinatesForLocations,
  getLocationCoordinates,
} from '@/utils/distanceUtils';

export const getContact = (contact: ContactDetail): ContactProps => {
  return {
    name: contact?.name,
    phone: contact?.telecom?.find(info => info.system === 'phone' && info.value)?.value,
    email: contact?.telecom?.find(info => info.system === 'email' && info.value)?.value,
  };
};

const getConditions = (study: ResearchStudy): string[] => study.condition?.map(({ text }) => text) || [];

export const getDetails = (studyProps: StudyDetailProps): StudyDetail[] => {
  const details = [
    { header: MainRowKeys.conditions, body: studyProps.conditions.join(', ') },
    { header: MainRowKeys.trialId, body: studyProps.trialId },
    { header: MainRowKeys.source, body: studyProps.source },
    { header: MainRowKeys.description, body: studyProps.description },
    { header: MainRowKeys.eligibility, body: studyProps.eligibility },
  ];
  return details.filter(({ body }) => (Array.isArray(body) ? body.length > 0 : body));
};

const getTrialId = (study: ResearchStudy) => study.identifier?.[0]?.value;

const getSource = () => 'Unknown'; // TODO

const getDescription = (study: ResearchStudy) => study.description?.trim();

const getEligibility = (study: ResearchStudy) => study.enrollment?.[0]?.display.trim();

const getKeywords = (study: ResearchStudy): string[] => study.keyword?.map(({ text }) => text.replace(/_/g, ' '));

const getLikelihood = (search: BundleEntrySearch): LikelihoodProps => {
  const score = search?.score;
  if (score >= 0.75) return { text: 'High-likelihood match', color: 'common.green' };
  else if (score >= 0.01) return { text: 'Possible match', color: 'common.yellow' };
  else if (score < 0.01) return { text: 'No match', color: 'common.red' };
  else return { text: 'Unknown likelihood', color: 'common.grayLight' };
};

const getPeriod = (study: ResearchStudy): string => {
  const startDate = study?.period?.start && format(new Date(study.period.start), 'PP');
  const endDate = study?.period?.end && format(new Date(study.period.end), 'PP');
  return startDate ? (endDate ? `${startDate} - ${endDate}` : startDate) : null;
};

const getPhase = (study: ResearchStudy): string => study.phase?.text;

const getContacts = (study: ResearchStudy): ContactProps[] => {
  return study?.contact?.map(getContact) || [];
};

const getSponsor = (study: ResearchStudy): ContactProps => {
  const sponsorId = study?.sponsor?.reference?.match(/\#(.*)/)?.[1];
  const sponsor: Organization = study?.contained?.find(
    ({ resourceType, id }) => resourceType === 'Organization' && id === sponsorId
  ) as Organization;
  return getContact(sponsor);
};

const getStatus = (study: ResearchStudy): StatusProps => {
  const status = study.status?.replace(/-/g, ' ');
  switch (study.status) {
    case 'active':
    case 'administratively-completed':
    case 'approved':
    case 'completed':
      return { text: status, color: 'common.green' };
    case 'in-review':
      return { text: status, color: 'common.yellow' };
    case 'closed-to-accrual':
    case 'closed-to-accrual-and-intervention':
    case 'disapproved':
    case 'temporarily-closed-to-accrual':
    case 'temporarily-closed-to-accrual-and-intervention':
    case 'withdrawn':
      return { text: status, color: 'common.red' };
    default:
      return { text: status, color: 'common.gray' };
  }
};

const getTitle = (study: ResearchStudy): string => study.title;

const getType = (study: ResearchStudy): string => {
  for (const { text } of study.category || []) {
    const match = text.match(/Study Type: (.+)$/)?.[1];
    if (match) return match;
  }
};

const getClosestFacilities = (locations: Location[], zipcode: string, numOfFacilities = 5): ContactProps[] => {
  const origin = getZipcodeCoordinates(zipcode);
  return getCoordinatesForLocations(locations)
    .map(({ name, telecom, position }) => ({
      contact: { name, telecom },
      distance: getDistanceBetweenPoints(origin, getLocationCoordinates({ position } as Location)),
    }))
    .sort((first, second) => first.distance - second.distance)
    .slice(0, numOfFacilities)
    .map(({ contact, distance }) => ({
      ...getContact(contact),
      distance: distance !== null ? `${distance} miles` : 'Unknown distance',
    }));
};

export const getStudyDetailProps = (entry: BundleEntry, zipcode: string): StudyDetailProps => {
  const { resource, search } = entry as BundleEntry & { resource: ResearchStudy };
  // Grab the locations so we only have to do this once
  const locations = getLocations(resource);

  return {
    conditions: getConditions(resource),
    trialId: getTrialId(resource),
    source: getSource(),
    description: getDescription(resource),
    eligibility: getEligibility(resource),
    keywords: getKeywords(resource),
    likelihood: getLikelihood(search),
    period: getPeriod(resource),
    phase: getPhase(resource),
    sponsor: getSponsor(resource),
    contacts: getContacts(resource),
    status: getStatus(resource),
    title: getTitle(resource),
    type: getType(resource),
    closestFacilities: getClosestFacilities(locations, zipcode),
    locations: locations,
  };
};
