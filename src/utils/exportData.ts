// NOTE: Uncomment this out for facilities information
//import { getContact } from '@/components/Results/utils';
import { stringify as csvStringify } from 'csv-stringify/sync';
import FileSaver from 'file-saver';
import { FullSearchParameters } from 'types/search-types';
import { v4 as uuidv4 } from 'uuid';
import XLSX from 'xlsx';
import { StudyDetail, StudyDetailProps } from '../components/Results/types';

// NOTE: Uncomment this out for facilities information
// const SiteRowKeys = {
//   facility: 'Facility',
//   phone: 'Phone',
//   email: 'Email',
// };

export const MainRowKeys = {
  trialId: 'Trial Id',
  source: 'Source',
  likelihood: 'Match Likelihood',
  title: 'Title',
  status: 'Overall Status',
  period: 'Period',
  phase: 'Trial Phase',
  conditions: 'Conditions',
  type: 'Study Type',
  description: 'Description',
  eligibility: 'Eligibility',
  sponsor: 'Sponsor',
  contactName: 'Overall Contact',
  contactPhone: 'Overall Contact Phone',
  contactEmail: 'Overall Contact Email',
};

// Translates redcaps
export const RedCapHeaders = [
  'record_id',
  'redcap_event_name',
  'redcap_repeat_instrument',
  'redcap_repeat_instance',
  'trial_id',
  'source',
  'match_likelihood',
  'title',
  'overall_status',
  'period',
  'trial_phase',
  'conditions',
  'study_type',
  'description',
  'eligibility',
  'sponsor',
  'contact',
  'contact_phone',
  'contact_email',
  'age',
  'ps_scale',
  'ecog',
  'kps',
  'cancer_diagnosis',
  'histology___1',
  'biomarkers',
  'stage',
];

const getMainRow = (studyProps: StudyDetailProps, userId: string): Record<string, string> =>
  convertToSpreadsheetRow(
    [
      { header: MainRowKeys.trialId, body: studyProps.trialId },
      { header: MainRowKeys.source, body: studyProps.source },
      { header: MainRowKeys.likelihood, body: studyProps.likelihood?.text || '' },
      { header: MainRowKeys.title, body: studyProps.title || '' },
      { header: MainRowKeys.status, body: studyProps.status?.label || '' },
      { header: MainRowKeys.period, body: studyProps.period || '' },
      { header: MainRowKeys.phase, body: studyProps.phase || '' },
      { header: MainRowKeys.conditions, body: JSON.stringify(studyProps?.conditions) || '' },
      { header: MainRowKeys.type, body: studyProps.type?.label || studyProps.type?.name || '' },
      { header: MainRowKeys.description, body: studyProps.description || '' },
      { header: MainRowKeys.eligibility, body: studyProps.eligibility || '' },
      { header: MainRowKeys.sponsor, body: studyProps.sponsor?.name || '' },
      { header: MainRowKeys.contactName, body: studyProps.contacts?.[0]?.name || '' },
      { header: MainRowKeys.contactPhone, body: studyProps.contacts?.[0]?.phone || '' },
      { header: MainRowKeys.contactEmail, body: studyProps.contacts?.[0]?.email || '' },
    ],
    userId
  );

// NOTE: Uncomment this out to get facilities information
// const getSiteRow = (contact: ContactProps, userId: string): Record<string, string> =>
//   convertToSpreadsheetRow(
//     [
//       { header: SiteRowKeys.facility, body: contact['name'] },
//       ...(contact?.phone ? [{ header: SiteRowKeys.phone, body: contact['phone'] }] : []),
//       ...(contact?.email ? [{ header: SiteRowKeys.email, body: contact['email'] }] : []),
//     ],
//     userId
//   );

export const unpackStudies = (entries: StudyDetailProps[], userId: string): Record<string, string>[] => {
  const matchCount: StudyDetail[] = [{ header: 'Match Count', body: entries.length.toString() }];
  let data: Record<string, string>[] = [convertToSpreadsheetRow(matchCount, userId)];

  for (const entry of entries) {
    const mainRow = getMainRow(entry, userId);
    data = [...data, mainRow];

    /** TODO: To remove location multi-lined oddities, leave this out for now. */
    // const siteRows = entry.locations?.map(getContact).map(contact => getSiteRow(contact, userId));
    // const studyRow = [mainRow, ...(siteRows || [])];
    // data = [...data, ...studyRow];
  }

  return data;
};

const convertToSpreadsheetRow = (details: StudyDetail[], userId: string): Record<string, string> => {
  const newDatum = { 'User Id': userId };
  for (const detail of details) {
    newDatum[detail.header] = detail.body;
  }
  return newDatum;
};

export const exportSpreadsheetData = (data: Record<string, string>[], fileName: string): void => {
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(blob, fileName + fileExtension);
};

export const exportCsvStringData = (patientSearch: FullSearchParameters, data: StudyDetailProps[]): string => {
  const patientElements = convertPatientInfoToRedCapRow(patientSearch);
  const record_id = uuidv4();
  const entries = data.map(entry => {
    const trialElements = convertResultsToRedCapRow(entry);
    return { record_id, ...trialElements };
  });
  return csvStringify([RedCapHeaders]) + csvStringify([{ record_id, ...patientElements }]) + csvStringify(entries);
};

const convertResultsToRedCapRow = (data: StudyDetailProps) => {
  return {
    redcap_event_name: 'match_arm_1',
    redcap_repeat_instrument: 'trial_matches_intervention_arm_1',
    redcap_repeat_instance: 'new',
    trial_id: data.trialId,
    source: data.source,
    match_likelihood: data.likelihood?.text || '',
    title: data.title || '',
    overall_status: data.status?.label || '',
    period: data.period || '',
    trial_phase: data.phase || '',
    conditions: JSON.stringify(data?.conditions) || '',
    study_type: data.type?.label || data.type?.name || '',
    description: data.description || '',
    eligibility: data.eligibility || '',
    sponsor: data.sponsor?.name || '',
    contact: data.contacts?.[0]?.name || '',
    contact_phone: data.contacts?.[0]?.phone || '',
    contact_email: data.contacts?.[0]?.email || '',
    age: '',
    ps_scale: '',
    ecog: '',
    kps: '',
    cancer_diagnosis: '',
    histology___1: '',
    biomarkers: '',
    stage: '',
  };
};

// The same
const convertPatientInfoToRedCapRow = (patientSearch: FullSearchParameters) => {
  const ecogScore = patientSearch.ecogScore ? JSON.parse(patientSearch.ecogScore)?.valueInteger : '';
  const karnofskyScore = patientSearch.karnofskyScore ? JSON.parse(patientSearch.karnofskyScore)?.valueInteger : '';
  const cancerType: string = patientSearch.cancerType ? JSON.parse(patientSearch.cancerType)?.cancerType[0] : '';
  // const cancerSubtype: string = patientSearch.cancerSubtype ? JSON.parse(patientSearch.cancerSubtype)?.category[0] : '';
  // const metastasis:string = patientSearch.metastasis ? JSON.parse(patientSearch.metastasis)?.category[0] : '';
  const stage: string = patientSearch.stage ? JSON.parse(patientSearch.stage)?.category[0] : '';
  console.log('Biomarkers', patientSearch.biomarkers);
  const biomarkers: string = patientSearch.biomarkers
    ? JSON.parse(patientSearch.biomarkers)
        .map(biomarker => {
          const qualifier =
            biomarker.qualifier?.code == '10828004' ? '+' : biomarker.qualifier?.code === '260385009' ? '-' : '';
          return biomarker.display + qualifier;
        })
        .join(', ')
    : '';

  return {
    redcap_event_name: 'match_arm_1',
    redcap_repeat_instrument: '',
    redcap_repeat_instance: '',
    trial_id: '',
    source: '',
    match_likelihood: '',
    title: '',
    overall_status: '',
    period: '',
    trial_phase: '',
    conditions: '',
    study_type: '',
    description: '',
    eligibility: '',
    sponsor: '',
    contact: '',
    contact_phone: '',
    contact_email: '',
    age: patientSearch.age || '',
    ps_scale: karnofskyScore ? 1 : ecogScore || ecogScore === 0 ? 2 : '',
    ecog: ecogScore,
    kps: karnofskyScore,
    cancer_diagnosis: cancerType,
    histology___1: '',
    biomarkers: biomarkers,
    stage: stage,
  };
};
