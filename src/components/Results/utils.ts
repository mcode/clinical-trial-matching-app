import { BundleEntrySearch, ContactDetail, Organization, ResearchStudy, Location, PlanDefinition } from 'fhir/r4';
import { format } from 'date-fns';
import {
  BundleEntry,
  ContactProps,
  LikelihoodProps,
  StatusProps,
  StudyDetail,
  StudyDetailProps,
  TypeProps,
} from './types';
import { MainRowKeys } from '@/utils/exportData';
import {
  getZipcodeCoordinates,
  getDistanceBetweenPoints,
  getLocations,
  getCoordinatesForLocations,
  getLocationCoordinates,
} from '@/utils/distanceUtils';
import { ArmGroup } from '.';

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
    { header: MainRowKeys.phase, body: studyProps.phase },
    { header: MainRowKeys.type, body: studyProps.type?.name || studyProps.type?.label },
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
  if (score >= 0.75) return { text: 'High-likelihood match', color: 'common.green', score };
  else if (score >= 0.01) return { text: 'Possible match', color: 'common.yellow', score };
  else if (score < 0.01) return { text: 'No match', color: 'common.red', score };
  // Even if a trial doesn't have a likelihood, it might be better for the patient to decide whether it's a match than for them to never see it
  else return { text: 'Possible match', color: 'common.yellow', score: 0.5 };
};

const getPeriod = (study: ResearchStudy): string => {
  const startDate = study?.period?.start && format(new Date(study.period.start), 'PP');
  const endDate = study?.period?.end && format(new Date(study.period.end), 'PP');
  return startDate ? (endDate ? `${startDate} - ${endDate}` : startDate) : null;
};

const getPhase = (study: ResearchStudy): string => study.phase?.text || 'Unknown Trial Phase';

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
  const label = study.status
    ?.replace(/-/g, ' ')
    .replace(/\w+\b(?<!\b(to|and))/g, word => word[0].toUpperCase() + word.slice(1));

  switch (study.status) {
    case 'active':
    case 'administratively-completed':
    case 'approved':
    case 'completed':
      return { name: study.status, label, color: 'common.green' };
    case 'in-review':
      return { name: study.status, label, color: 'common.yellow' };
    case 'closed-to-accrual':
    case 'closed-to-accrual-and-intervention':
    case 'disapproved':
    case 'temporarily-closed-to-accrual':
    case 'temporarily-closed-to-accrual-and-intervention':
    case 'withdrawn':
      return { name: study.status, label, color: 'common.red' };
    default:
      return { name: 'unknown-recruitment-status', label: 'Unknown Recruitment Status', color: 'common.gray' };
  }
};

const getTitle = (study: ResearchStudy): string => study.title;

const getType = (study: ResearchStudy): TypeProps => {
  for (const { text } of study.category || []) {
    const match = text.match(/Study Type: (.+)$/)?.[1];
    // https://react-hook-form.com/api/useform/register/
    // React Hook Form uses array brackets and periods to create nested structures.
    // We use the study type to create checkbox filters in the Sidebar.
    // Unless we remove those characters, passing in the Study Type as the Controller.name will break its state.
    const matchWithoutIllegalCharacters = match?.replace(/\./, '').replace(/\[/, '(').replace(/\]/, ')');
    if (matchWithoutIllegalCharacters) {
      return { name: matchWithoutIllegalCharacters, label: match };
    }
  }
  return { name: 'Unknown Study Type' };
};

const getArmsAndInterventions = (study: ResearchStudy): ArmGroup[] => {
  const arms = {};

  // Dont bother if there are no arms and interventions
  const noArms: boolean = study.arm == undefined || study.arm == null || study.arm.length == 0;
  const noInterventions: boolean = study.protocol == undefined || study.protocol == null || study.protocol.length == 0;
  if (noArms || noInterventions) {
    return [];
  }

  // Function for looking up local reference
  const getIntervention = (referenceId: string) =>
    study.contained.find(({ resourceType, id }) => resourceType === 'PlanDefinition' && referenceId === id);

  // Map the references in the protocol to the local reference
  const interventions = study?.protocol?.map(item =>
    item.reference.length == 0 ? null : (getIntervention(item.reference.substr(1)) as PlanDefinition)
  );

  // Set up the arm groups -- we'll use the name of the arm group as the key.
  for (const arm of study.arm) {
    arms[arm.name] = {
      display: arm.type ? (arm?.type?.text ? arm.type.text + ': ' + arm.name : '') : '',
      ...(arm.description && { description: arm.description }),
      interventions: [],
    } as ArmGroup;
  }

  // Map the interventions to their arm group.
  for (const intervention of interventions) {
    // Text of the subjectCodeableConcept is the arm group; this is necessary for us to map!
    if (intervention?.subjectCodeableConcept?.text) {
      const formatted_intervention = {
        ...(intervention?.type?.text && { type: intervention.type.text }),
        ...(intervention?.title && { title: intervention.title }),
        ...(intervention?.subtitle && { subtitle: intervention.subtitle }),
        ...(intervention?.description && { description: intervention.description }),
      };
      arms[intervention.subjectCodeableConcept.text].interventions.push(formatted_intervention);
    }
  }

  return Object.values(arms);
};

const getClosestFacilities = (locations: Location[], zipcode: string, numOfFacilities = 5): ContactProps[] => {
  const origin = getZipcodeCoordinates(zipcode);
  return getCoordinatesForLocations(locations)
    .map(({ name, telecom, position }) => {
      const positionCoordinates = getLocationCoordinates({ position } as Location);
      const quantity = getDistanceBetweenPoints(origin, positionCoordinates);

      return {
        contact: { name, telecom },
        ...(origin && quantity
          ? {
              distance: {
                quantity,
                units: 'miles',
              },
            }
          : {}),
      };
    })
    .sort((first, second) => {
      if (first.distance?.quantity && second.distance?.quantity) {
        return first.distance.quantity - second.distance.quantity;
      } else {
        return 0;
      }
    })
    .slice(0, numOfFacilities);
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
    arms: getArmsAndInterventions(resource),
    closestFacilities: getClosestFacilities(locations, zipcode),
    locations: locations,
  };
};
