#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

// Script to test that wrappers are running.

const testBundle = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: [
    {
      resource: {
        resourceType: 'Parameters',
        id: '0',
        parameter: [
          {
            name: 'zipCode',
            valueString: '67446',
          },
          {
            name: 'travelRadius',
            valueString: '1500',
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'Patient',
        id: 'fglscNH3Ke3tYmWe-UQEu',
        gender: 'female',
        birthDate: '1968',
      },
      fullUrl: 'urn:uuid:fglscNH3Ke3tYmWe-UQEu',
    },
    {
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-primary-cancer-condition'],
        },
        subject: {
          reference: 'urn:uuid:fglscNH3Ke3tYmWe-UQEu',
          type: 'Patient',
        },
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '408643008',
              display: 'Infiltrating duct carcinoma of breast (disorder)',
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '64572001',
              },
            ],
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        subject: {
          reference: 'urn:uuid:fglscNH3Ke3tYmWe-UQEu',
          type: 'Patient',
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA9622-7',
                display: 'Fully active, able to carry on all pre-disease performance without restriction',
              },
            ],
          },
        ],
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-ecog-performance-status'],
        },
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '89247-1',
            },
          ],
        },
        valueInteger: 0,
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-observation-category',
                code: 'clinical-test',
              },
            ],
          },
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'survey',
              },
            ],
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        subject: {
          reference: 'urn:uuid:fglscNH3Ke3tYmWe-UQEu',
          type: 'Patient',
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA29175-9',
                display: 'Normal; no complaints; no evidence of disease',
              },
            ],
          },
        ],
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-karnofsky-performance-status'],
        },
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '89243-0',
            },
          ],
        },
        valueInteger: 100,
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-observation-category',
                code: 'clinical-test',
              },
            ],
          },
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'survey',
              },
            ],
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'MedicationStatement',
        subject: {
          reference: 'urn:uuid:fglscNH3Ke3tYmWe-UQEu',
          type: 'Patient',
        },
        status: 'completed',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '258494',
              display: 'exemestane',
            },
          ],
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-statement'],
        },
        effectiveDateTime: '2023-05-04T19:41:59.078Z',
      },
    },
    {
      resource: {
        resourceType: 'MedicationStatement',
        subject: {
          reference: 'urn:uuid:fglscNH3Ke3tYmWe-UQEu',
          type: 'Patient',
        },
        status: 'completed',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '387017005',
            },
          ],
        },
        meta: {
          profile: ['http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-statement'],
        },
        effectiveDateTime: '2023-05-04T19:41:59.078Z',
      },
    },
  ],
};

const testBundleString = JSON.stringify(testBundle, null, 2);

// Defaults
let wrappers = [];
let protocol = 'http';
let hostname = 'localhost';

// Parse command line arguments
// param (
//     # Name of wrappers to install
//     [string[]]$Wrappers = @("ancora.ai", "breastcancertrials.org", "carebox", "lungevity"),
//     [string]$Protocol = "http",
//     [string]$Hostname = "localhost"
// )

for (let idx = 2; idx < process.argv.length; idx++) {
  const arg = process.argv[idx];
  if (arg == '--protocol' || arg == '--hostname' || arg == '--wrappers') {
    idx++;
    if (idx < process.argv.length) {
      const value = process.argv[idx];
      if (arg == '--protocol') {
        protocol = value;
      } else if (arg == '--hostname') {
        hostname = value;
      } else if (arg == '--wrappers') {
        wrappers.push(...value.split(/\s*,\s*/));
      }
    }
  }
}

const http = require(protocol === 'https' ? 'node:https' : 'node:http');

class ServerErrorException extends Error {
  constructor(message, response, body) {
    super();
    this.message = message;
    this.response = response;
    this.body = body;
  }

  toString() {
    return this.message;
  }
}

function invokeRestMethod(options, body) {
  if (!options.hostname) {
    options.hostname = hostname;
  }
  return new Promise((resolve, reject) => {
    const request = http.request(options, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        // Handle redirects we can handle
        if (
          res.statusCode === 301 ||
          res.statusCode === 302 ||
          res.statusCode === 303 ||
          res.statusCode === 307 ||
          res.statusCode === 308
        ) {
          if (!res.headers.location) {
            reject(
              new ServerErrorException(
                `Redirected via HTTP ${res.statusCode} ${res.statusMessage} but no location header`,
                res
              )
            );
            return;
          }
          const location = new URL(res.headers.location, new URL(`${protocol}://${options.hostname}/`));
          if (res.statusCode === 303) {
            // Change to a GET
            options.method = 'GET';
            // And remove the body
            body = undefined;
          }
          if (location.protocol !== protocol + ':') {
            reject(new Error(`Not redirecting from ${protocol} to ${location.protocol} for these tests`));
            return;
          }
          options.hostname = location.hostname;
          options.path = location.pathname;
          // And then send the redirect
          resolve(invokeRestMethod(options, body));
          return;
        }
        // Otherwise, fall through to gather the body
      }
      const responseBody = [];
      res.on('data', chunk => {
        responseBody.push(chunk);
      });
      res.on('end', () => {
        const bodyStr = responseBody.join('');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(bodyStr);
        } else {
          reject(new ServerErrorException(`HTTP ${res.statusCode} ${res.statusMessage} from server`, res, bodyStr));
        }
      });
    });
    request.on('error', reject);
    if (body) {
      request.write(body);
    }
    request.end();
  });
}

const colors = process.stdout.isTTY && process.stdout.hasColors();

function testStart(message) {
  process.stdout.write('  ' + message);
}

function testPassed(warnings) {
  process.stdout.write(' ');
  if (warnings) {
    if (colors) {
      process.stdout.write('\x1b[93;40m');
    }
    process.stdout.write('OK?');
    if (colors) {
      process.stdout.write('\x1b[0m');
    }
    process.stdout.write('\n' + warnings + '\n');
  } else {
    if (colors) {
      process.stdout.write('\x1b[92;40m');
    }
    process.stdout.write('OK');
    if (colors) {
      process.stdout.write('\x1b[0m');
    }
    process.stdout.write('\n');
  }
}

function testFailed(ex) {
  process.stdout.write(' ');
  if (colors) {
    process.stdout.write('\x1b[91;40m');
  }
  process.stdout.write('FAILED');
  if (colors) {
    process.stdout.write('\x1b[0m');
  }
  process.stdout.write('\n');
  if (ex) {
    process.stdout.write(ex.toString() + '\n');
    if (ex instanceof ServerErrorException) {
      if (ex.body) {
        process.stdout.write('\n  Server returned error body:\n');
        process.stdout.write(ex.body);
        process.stdout.write('\n');
      }
    }
  }
}

async function runTests() {
  if (wrappers.length === 0) {
    console.log('Loading available wrappers from wrappers.json...');
    try {
      const wrapperConfig = JSON.parse(await fs.readFile(path.join(__dirname, 'wrappers.json')));
      wrappers = Object.keys(wrapperConfig);
    } catch (ex) {
      console.error('Unable to load wrappers.json:');
      console.error(ex);
      return;
    }
  }
  console.log(`Running tests against ${protocol}://${hostname}/...`);
  console.log('-- Testing Frontend app --');
  try {
    testStart('Sending basic "up and running" test...');
    const result = await invokeRestMethod({
      path: '/',
    });
    // TODO: Check the result
    testPassed();
  } catch (ex) {
    testFailed(ex);
  }

  for (const wrapper of wrappers) {
    console.log(`-- Testing ${wrapper} --`);
    try {
      testStart('Sending basic "up and running" test...');
      let result = await invokeRestMethod({
        path: '/' + wrapper,
      });
      if (result == 'Hello from the Clinical Trial Matching Service') {
        testPassed();
      } else {
        testPassed('Request succeeded, but the response was not the expected value.');
        console.log(`Unexpected response: ${result}`);
      }
      testStart('Invoking search...');
      try {
        result = await invokeRestMethod(
          {
            path: `/${wrapper}/getClinicalTrial`,
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          },
          testBundleString
        );
        try {
          result = JSON.parse(result);
          if (result.resourceType === 'Bundle' && typeof result.total === 'number') {
            testPassed();
            console.log(`  Received ${result.total} results`);
          } else {
            testPassed('Unexpected response from wrapper: not a FHIR bundle.');
            console.log('Server responsed with: %j', result);
          }
        } catch (ex) {
          testPassed(`Failed to parse result: ${ex.toString()}`);
        }
      } catch (ex) {
        testFailed(ex);
        console.log(
          '  The wrapper is running, this failure may be caused by the backend itself and not the CTMS software.'
        );
      }
    } catch (ex) {
      testFailed(ex);
    }
  }
}
runTests()
  .then(() => {
    // Do nothing
  })
  .catch(error => {
    console.error('Running tests failed!');
    console.error('This is likely an error in the test script itself.');
    console.error(error);
  });
