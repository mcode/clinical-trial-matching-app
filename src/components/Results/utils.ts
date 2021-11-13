import { BundleEntry, ContactDetail, Organization, ResearchStudy, DomainResource } from 'fhir/r4';
import { format } from 'date-fns';
import { ContactProps, LikelihoodProps, StatusProps, StudyDetail, StudyProps } from './types';
import {
  getZipcodeCoordinates,
  getLocationsWithCoordinates,
  getCoordinatesOfClosestLocation,
  getDistanceBetweenPoints,
  coordinatesAreEqual,
} from '@/utils/distanceUtils';
import { ParsedUrlQuery } from 'querystring';

const getContact = (contact: ContactDetail): ContactProps => {
  return {
    name: contact?.name,
    phone: contact?.telecom?.find(info => info.system === 'phone' && info.value)?.value,
    email: contact?.telecom?.find(info => info.system === 'email' && info.value)?.value,
  };
};

const getClosestFacility = (study: DomainResource, { zipcode }: ParsedUrlQuery): ContactProps => {
  const origin = getZipcodeCoordinates(zipcode as string);
  const locations = getLocationsWithCoordinates(study);
  const closest = getCoordinatesOfClosestLocation(origin, locations);
  const distance = getDistanceBetweenPoints(origin, closest);
  const location = closest && locations.find(coordinatesAreEqual(closest));
  return {
    ...getContact(location),
    distance: distance !== null ? `${distance} miles` : 'Unknown distance',
  };
};

const getConditions = (study: ResearchStudy): string[] => study.condition?.map(({ text }) => text);

const getDetails = (study: ResearchStudy): StudyDetail[] => {
  const details = [
    { header: 'Conditions', body: study.condition?.map(({ text }) => text).join(', ') },
    { header: 'Trial Id', body: study.identifier?.[0]?.value },
    { header: 'Source', body: 'Unknown' }, // TODO
    { header: 'Description', body: study.description?.trim() },
    { header: 'Eligibility', body: study.enrollment?.[0]?.display.trim() },
  ];
  return details.filter(({ body }) => (Array.isArray(body) ? body.length > 0 : body));
};

const getKeywords = (study: ResearchStudy): string[] => study.keyword?.map(({ text }) => text.replace(/_/g, ' '));

const getLikelihood = (study: BundleEntry): LikelihoodProps => {
  const score = study.search?.score || 1;
  if (score >= 0.75) return { text: 'High-likelihood match', color: 'common.green' };
  else if (score >= 0.01) return { text: 'Possible match', color: 'common.yellow' };
  else if (score < 0.01) return { text: 'No match', color: 'common.red' };
  else return { text: 'Unknown likelihood', color: 'common.grayLight' };
};

const getPeriod = (study: ResearchStudy): string => {
  const startDate = study?.period?.start && format(new Date(study.period.start), 'PP');
  const endDate = study?.period?.end;
  return startDate ? (endDate ? `${startDate} - ${endDate}` : startDate) : null;
};

const getPhase = (study: ResearchStudy): string => study.phase.text;

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
  const status = study.status?.replace(/-/g, ' ') || '';
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

export const getStudyProps = (study: ResearchStudy, query: ParsedUrlQuery): StudyProps => {
  return {
    closestFacility: getClosestFacility(study, query),
    conditions: getConditions(study),
    details: getDetails(study),
    keywords: getKeywords(study),
    likelihood: getLikelihood(study),
    period: getPeriod(study),
    phase: getPhase(study),
    sponsor: getSponsor(study),
    contacts: getContacts(study),
    status: getStatus(study),
    title: getTitle(study),
    type: getType(study),
  };
};
