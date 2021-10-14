import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { Bundle, BundleEntry, FhirResource } from 'fhir/r4';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

type Result = {
  'bundle id': string;
  'transaction status': string;
  'entry statuses': string;
};

const cloneAndConvertToTransaction = (bundle: Bundle, baseURL: string): Bundle => {
  const clone: Bundle = JSON.parse(JSON.stringify(bundle));
  clone.type = 'transaction';
  const entries: BundleEntry[] = clone.entry;

  for (const entry of entries) {
    entry.fullUrl = `${baseURL}/${entry.resource.resourceType}/${entry.resource.id}`;
    entry.request = {
      method: 'PUT',
      url: `${entry.resource.resourceType}/${entry.resource.id}`,
    };
  }

  return clone;
};

const dumpTestPatientJSON = (release: string, fileName: string, patient: FhirResource, converted: Bundle): void => {
  const dumpFolder = path.join(__dirname, '..', '..', 'test_patient_dump', release);
  mkdirp.sync(dumpFolder);

  const patientFilepath = path.join(dumpFolder, fileName.replace('.json', '_patient.json'));
  fs.writeFileSync(patientFilepath, JSON.stringify(patient, null, 2), 'utf8');

  const convertedFilepath = path.join(dumpFolder, fileName.replace('.json', '_entries.json'));
  fs.writeFileSync(convertedFilepath, JSON.stringify(converted, null, 2), 'utf8');
};

const getResult = (name: string, response: AxiosResponse<Bundle>): Result => {
  const status = `${response.status} ${response.statusText}`;
  const statusMap = {};
  if (response.data && response.data.entry) {
    response.data.entry.forEach((entry: BundleEntry) => {
      const entryStatus = entry.response && entry.response.status ? entry.response.status : 'unknown';
      if (!statusMap[entryStatus]) {
        statusMap[entryStatus] = 1;
      } else {
        statusMap[entryStatus] = statusMap[entryStatus] + 1;
      }
    });
  } else {
    statusMap[status] = 1;
  }

  return { 'bundle id': name, 'transaction status': status, 'entry statuses': JSON.stringify(statusMap) };
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

    const json: Bundle = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (json.resourceType !== 'Bundle') {
      console.error('Test patients must be a valid FHIR Bundle.  Not a Bundle:', file);
      continue;
    }

    const request: Promise<Result[]> = getRequest(json, fileName);
    requests.push(request);
  }

  const flattenedResults = (await Promise.all(requests)).flat();
  console.log('url:', baseURL);
  console.table(flattenedResults);
  console.log();
};

const makeRequester = (
  release: string,
  baseURL: string,
  dump: boolean
): ((bundle: Bundle, fileName: string) => Promise<Result[]>) => {
  const getRequest = (bundle: Bundle, fileName: string): Promise<Result[]> => {
    const patient: FhirResource = bundle.entry.find(e => e.resource && e.resource.resourceType === 'Patient').resource;
    const entries: Bundle = JSON.parse(JSON.stringify(bundle));
    entries.id += '_entries';
    entries.entry = entries.entry.filter(e => e.resource && e.resource.resourceType !== 'Patient');

    const converted: Bundle = cloneAndConvertToTransaction(entries, baseURL);
    dump && dumpTestPatientJSON(release, fileName, patient, converted);

    const config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json' } };

    // Due to an issue w/ how the server handles transactions when a patient has been deleted, we post the patient
    // first and then the other stuff.
    const request: Promise<Result[]> = axios
      .put(`${baseURL}/Patient/${patient.id}`, JSON.stringify(patient), config)
      .then(
        (success: AxiosResponse<Bundle>) => {
          const results: Result[] = [];
          results.push(getResult(`${bundle.id}_patient`, success));

          axios.post(baseURL, JSON.stringify(converted), config).then(
            (success: AxiosResponse<Bundle>) => results.push(getResult(entries.id, success)),
            (error: AxiosError<Bundle>) => results.push(getResult(entries.id, error.response))
          );

          return results;
        },
        (error: AxiosError<Bundle>) => [getResult(patient.id, error.response)]
      );

    return request;
  };
  return getRequest;
};

const main = (): void => {
  const SMART_HEALTH_IT_ENDPOINT = 'https://r4.smarthealthit.org';
  const MOONSHOT_ENDPOINT = 'http://moonshot-dev.mitre.org:4006/baseR4';

  const args = process.argv.slice(2);
  const dump = args.length !== 0 && args[0] === '--dump';
  const uploadR4 = (baseURL: string) => upload('R4', baseURL, path.join(__dirname, 'r4_test_patients'), dump);

  uploadR4(SMART_HEALTH_IT_ENDPOINT);
  uploadR4(MOONSHOT_ENDPOINT);
};

main();

export {};
