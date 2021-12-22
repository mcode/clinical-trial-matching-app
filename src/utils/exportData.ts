import FileSaver from 'file-saver';
import XLSX from 'xlsx';

import { getContact, getStudyProps } from '@/components/Results/utils';
import { BundleEntry, StudyProps, StudyDetail, ContactProps } from '../components/Results/types';
import { getLocations } from './distanceUtils';

const SiteRowKeys = {
  facility: 'Facility',
  phone: 'Phone',
  email: 'Email',
};

export const MainRowKeys = {
  trialId: 'Trial Id',
  source: 'Source',
  likelihood: 'Match Likelihood',
  title: 'Title',
  status: 'Overall Status',
  period: 'Period',
  phase: 'Phase',
  conditions: 'Conditions',
  type: 'Study Type',
  description: 'Description',
  eligibility: 'Eligibility',
  sponsor: 'Sponsor',
  contactName: 'Overall Contact',
  contactPhone: 'Overall Contact Phone',
  contactEmail: 'Overall Contact Email',
};

const getMainRow = (studyProps: StudyProps): Record<string, string> =>
  convertToSpreadsheetRow([
    { header: MainRowKeys.trialId, body: studyProps.trialId },
    { header: MainRowKeys.likelihood, body: studyProps.likelihood.text },
    { header: MainRowKeys.title, body: studyProps.title },
    { header: MainRowKeys.status, body: studyProps.status.text },
    { header: MainRowKeys.period, body: studyProps.period },
    { header: MainRowKeys.phase, body: studyProps.phase },
    { header: MainRowKeys.conditions, body: JSON.stringify(studyProps.conditions) },
    { header: MainRowKeys.type, body: studyProps.type },
    { header: MainRowKeys.description, body: studyProps.description },
    { header: MainRowKeys.eligibility, body: studyProps.eligibility },
    { header: MainRowKeys.sponsor, body: studyProps.sponsor.name },
    { header: MainRowKeys.contactName, body: studyProps.contacts?.[0]?.name },
    { header: MainRowKeys.contactPhone, body: studyProps.contacts?.[0]?.phone },
    { header: MainRowKeys.contactEmail, body: studyProps.contacts?.[0]?.email },
  ]);

const getSiteRow = (contact: ContactProps): Record<string, string> =>
  convertToSpreadsheetRow([
    { header: SiteRowKeys.facility, body: contact['name'] },
    { header: SiteRowKeys.phone, body: contact['phone'] },
    { header: SiteRowKeys.email, body: contact['email'] },
  ]);

export const unpackStudies = (entries: BundleEntry[]): Record<string, string>[] => {
  const matchCount: StudyDetail[] = [{ header: 'Match Count', body: entries.length.toString() }];
  let data: Record<string, string>[] = [convertToSpreadsheetRow(matchCount)];

  for (const entry of entries) {
    const studyProps = getStudyProps(entry);
    const mainRow = getMainRow(studyProps);
    const siteRows = getLocations(entry.resource).map(getContact).map(getSiteRow);
    const studyRow = [mainRow, ...siteRows];
    data = [...data, ...studyRow];
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
