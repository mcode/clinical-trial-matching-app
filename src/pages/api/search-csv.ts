import { createArrayCsvStringifier } from 'csv-writer';
import type { NextApiRequest, NextApiResponse } from 'next';

type CsvRecord = [string, string, string, string];

const createRecord = (params: { [key: string]: string | string[] }, name: string): CsvRecord => {
  const value = params[name] ?? '';
  if (Array.isArray(value)) {
    return [name, value.join(';'), '', ''];
  } else {
    return [name, value, '', ''];
  }
};

const generateOPDERecord = (records: CsvRecord[], json: Record<string, unknown>, name: string): void => {
  // With the value, try and generate the CSV record
  const display = json['display'] ?? '';
  const code = json['code'];
  const system = json['system'];
  if (typeof display === 'string' && typeof code === 'string' && typeof system === 'string') {
    // Valid value, append the record
    records.push([name, display, code, system]);
  } else {
    // Invalid, just ignore
  }
};

const generateOPDERecordsFromJson = (records: CsvRecord[], jsonString: string, name: string): void => {
  try {
    const json = JSON.parse(jsonString);
    if (typeof json !== 'object') {
      return undefined;
    }
    if (Array.isArray(json)) {
      // Indicates multiple values
      for (const value of json) {
        generateOPDERecord(records, value, name);
      }
      return;
    }
    // With the value, try and generate the CSV record
    const display = json['display'] ?? '';
    const code = json['code'];
    const system = json['system'];
    if (typeof display === 'string' && typeof code === 'string' && typeof system === 'string') {
      // Valid value, append the record
      records.push([name, display, code, system]);
    } else {
      // Invalid, just ignore
    }
  } catch (ex) {
    // In this case, just abort, eating the invalid data
  }
};

const addOPDERecords = (records: CsvRecord[], params: { [key: string]: string | string[] }, name: string): void => {
  const value = params[name];
  if (Array.isArray(value)) {
    // Iterate over the values
    for (const v of value) {
      generateOPDERecordsFromJson(records, v, name);
    }
  } else {
    generateOPDERecordsFromJson(records, value, name);
  }
};

const OPDE_FIELDS = [
  'cancerType',
  'cancerSubtype',
  'metastasis',
  'stage',
  'ecogScore',
  'karnofskyScore',
  'biomarkers',
  'surgery',
  'medications',
  'radiation',
];

/**
 * /api/search-csv
 *
 * Echos back search request as a CSV file.
 *
 * @param req
 * @param res
 */
const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  // Generate response
  res.status(200);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="search-parameters.csv"');
  // Store the results in a string for now
  const csv = createArrayCsvStringifier({
    header: ['OPDE Category', 'Value (text)', 'Code', 'System'],
  });
  const params = req.query;
  const records: CsvRecord[] = [
    createRecord(params, 'zipcode'),
    createRecord(params, 'travelDistance'),
    createRecord(params, 'gender'),
    createRecord(params, 'age'),
  ];

  for (const field of OPDE_FIELDS) {
    addOPDERecords(records, params, field);
  }

  res.send(csv.getHeaderString() + csv.stringifyRecords(records));
};

export default handler;
