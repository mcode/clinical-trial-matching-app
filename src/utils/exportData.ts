// NOTE: Uncomment this out for facilities information
//import { getContact } from '@/components/Results/utils';
import FileSaver from 'file-saver';
import _ from 'lodash';
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

const getMainRow = (studyProps: StudyDetailProps): Record<string, string> =>
  convertToSpreadsheetRow([
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
  ]);

// NOTE: Uncomment this out to get facilities information
// const getSiteRow = (contact: ContactProps): Record<string, string> =>
//   convertToSpreadsheetRow([
//     { header: SiteRowKeys.facility, body: contact['name'] },
//     ...(contact?.phone ? [{ header: SiteRowKeys.phone, body: contact['phone'] }] : []),
//     ...(contact?.email ? [{ header: SiteRowKeys.email, body: contact['email'] }] : []),
//   ]);

export const unpackStudies = (entries: StudyDetailProps[]): Record<string, string>[] => {
  const matchCount: StudyDetail[] = [{ header: 'Match Count', body: entries.length.toString() }];
  let data: Record<string, string>[] = [convertToSpreadsheetRow(matchCount)];

  for (const entry of entries) {
    const mainRow = getMainRow(entry);
    data = [...data, mainRow];

    /** TODO: To remove location multi-lined oddities, leave this out for now. */
    // const siteRows = entry.locations?.map(getContact).map(getSiteRow);
    // const studyRow = [mainRow, ...(siteRows || [])];
    // data = [...data, ...studyRow];
  }

  return data;
};

const convertToSpreadsheetRow = (details: StudyDetail[]): Record<string, string> => {
  const newDatum = {};
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

export const exportCsvStringData = (data: Record<string, string>[]): string => {
  // List of excluded keys
  const exclusion: string[] = ['eligibility'];

  // Add the headers
  let csvString = '';

  for (const key in MainRowKeys) {
    if (exclusion.includes(key)) {
      continue;
    }

    csvString += '"' + MainRowKeys[key] + '"' + '~';
  }
  csvString = _.trim(csvString, '~');

  data.forEach(entry => {
    // Filter out data if there's no trialId. This is basically for those mainly empty rows to hold facility data
    if (!entry[MainRowKeys['trialId']]) {
      return;
    }

    let row = '\n';
    for (const key in MainRowKeys) {
      if (exclusion.includes(key)) {
        continue;
      }

      row += '"' + entry[MainRowKeys[key]].replace('\n', '\r') + '"' + '~';
    }
    csvString += _.trimEnd(row, '~');
  });

  return csvString;
};
