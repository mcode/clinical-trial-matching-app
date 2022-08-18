import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Bundle, BundleEntry, FhirResource, OperationOutcome, Patient, Resource } from 'fhir/r4';
import * as fs from 'fs';
import * as https from 'https';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

type Result = {
  'resource id': string;
  'patient or entries?': 'patient' | 'entries';
  'transaction status': string;
  'resource statuses': string;
  'diagnostic message'?: string;
};

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const convertToTransaction = (bundle: Bundle, baseURL: string): Bundle => {
  bundle.type = 'transaction';
  const entries: BundleEntry[] = bundle.entry;

  for (const entry of entries) {
    entry.fullUrl = `${baseURL}/${entry.resource.resourceType}/${entry.resource.id}`;
    entry.request = {
      method: 'PUT',
      url: `${entry.resource.resourceType}/${entry.resource.id}`,
    };
  }

  return bundle;
};

const dumpTestPatientJSON = (release: string, fileName: string, patient: FhirResource, converted: Bundle): void => {
  const dumpFolder = path.join(__dirname, '..', '..', 'test_patient_dump', release);
  mkdirp.sync(dumpFolder);

  const patientFilepath = path.join(dumpFolder, fileName.replace('.json', '_patient.json'));
  fs.writeFileSync(patientFilepath, JSON.stringify(patient, null, 2), 'utf8');

  const convertedFilepath = path.join(dumpFolder, fileName.replace('.json', '_entries.json'));
  fs.writeFileSync(convertedFilepath, JSON.stringify(converted, null, 2), 'utf8');
};

const getResult = (
  resourceId: string,
  resourceName: 'patient' | 'entries',
  response: AxiosResponse<Bundle | Patient | OperationOutcome>
): Result => {
  const transactionStatus = `${response.status} ${response.statusText}`;
  const result = {
    'resource id': resourceId,
    'patient or entries?': resourceName,
    'transaction status': transactionStatus,
  };

  const statusMap = {};
  const processingEntriesUploadSuccesses = response.data && (response.data as Bundle).entry;
  const processingEntriesOrPatientUploadFailures = response.data && (response.data as OperationOutcome).issue;

  if (processingEntriesUploadSuccesses) {
    /* Can't expect to see a mix of successes and failures since we're uploading transaction bundles,
    which completely fail when even 1 entry fails to upload */
    const entries = (response.data as Bundle).entry;
    for (const entry of entries) {
      const entryStatus = entry.response && entry.response.status ? entry.response.status : 'unknown';
      if (!statusMap[entryStatus]) {
        statusMap[entryStatus] = 1;
      } else {
        statusMap[entryStatus] = statusMap[entryStatus] + 1;
      }
    }
  } else if (processingEntriesOrPatientUploadFailures) {
    const diagnosticMessage = (response.data as OperationOutcome).issue[0].diagnostics;
    result['diagnostic message'] = diagnosticMessage;
    statusMap[transactionStatus] = 1;
  } else {
    // Successful patient upload
    statusMap[transactionStatus] = 1;
  }

  result['resource statuses'] = JSON.stringify(statusMap);

  return result as Result;
};

const upload = async (release: string, baseURL: string, patientPath: string, dump: boolean): Promise<void> => {
  const requests: Promise<Result[]>[] = [];
  const fileNames: string[] = fs.readdirSync(patientPath);
  const getRequest = makeRequester(release, baseURL, dump);

  for (const fileName of fileNames) {
    const file: string = path.join(patientPath, fileName);
    if (!file.endsWith('.json')) {
      console.log('Skipping non-JSON file:', file);
      continue;
    }

    const json: Resource = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (json.resourceType !== 'Bundle') {
      console.error('Test patients must be a valid FHIR Bundle. Not a Bundle:', file);
      continue;
    }

    const request: Promise<Result[]> = getRequest(json as Bundle, fileName);
    requests.push(request);
  }

  await printResults(baseURL, requests);
};

const makeRequester = (
  release: string,
  baseURL: string,
  dump: boolean
): ((bundle: Bundle, fileName: string) => Promise<Result[]>) => {
  const getRequest = (bundle: Bundle, fileName: string): Promise<Result[]> => {
    const patient: FhirResource = bundle.entry.find(e => e.resource && e.resource.resourceType === 'Patient').resource;
    const entries: Bundle = getEntries(bundle, baseURL);
    dump && dumpTestPatientJSON(release, fileName, patient, entries);

    const patientConfig: AxiosRequestConfig = {
      url: `${baseURL}/Patient/${patient.id}`,
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(patient),
    };
    const entriesConfig: AxiosRequestConfig = {
      url: baseURL,
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(entries),
    };
    const getPatientResult = (id: string, response: AxiosResponse<Patient>) => getResult(id, 'patient', response);
    const getEntriesResult = (response: AxiosResponse<Bundle>) => getResult(entries.id, 'entries', response);

    /* In 2018, there was an issue with the SMART server bugging out when trying to PUT the entire input Bundle.
    If we PUT the Patient first and then POST the other entries, that seemed to result in less bugs. */
    const request: Promise<Result[]> = axiosInstance(patientConfig).then(
      async (success: AxiosResponse<Patient>) => {
        const patientSuccess = getPatientResult(`${bundle.id}_patient`, success);

        const entriesResult: Result = await axiosInstance(entriesConfig).then(
          (success: AxiosResponse<Bundle>) => getEntriesResult(success),
          (error: AxiosError<Bundle>) => getEntriesResult(error.response)
        );

        return [patientSuccess, entriesResult];
      },
      (error: AxiosError<Patient>) => {
        console.error(error);
        return [];
      }
    );

    return request;
  };
  return getRequest;
};

const getEntries = (bundle: Bundle, baseURL: string): Bundle => {
  const clone: Bundle = JSON.parse(JSON.stringify(bundle));
  clone.id += '_entries';
  clone.entry = clone.entry.filter(e => e.resource && e.resource.resourceType !== 'Patient');

  const converted: Bundle = convertToTransaction(clone, baseURL);
  return converted;
};

const printResults = async (baseURL: string, requests: Promise<Result[]>[]): Promise<void> => {
  const results = await Promise.all(requests);
  const flattenedResults = results.flat();
  console.log('url:', baseURL);
  console.table(flattenedResults, ['resource id', 'patient or entries?', 'transaction status', 'resource statuses']);
  console.table(
    flattenedResults.filter(result => !!result['diagnostic message']),
    ['resource id', 'diagnostic message']
  );
};

const main = (): void => {
  const SMART_HEALTH_IT_ENDPOINT = 'https://r4.smarthealthit.org';

  const args = process.argv.slice(2);
  const dump = args.length !== 0 && args[0] === '--dump';
  const uploadR4 = (baseURL: string) => upload('R4', baseURL, path.join(__dirname, 'r4_test_patients'), dump);

  uploadR4(SMART_HEALTH_IT_ENDPOINT);
};

main();

export {};
