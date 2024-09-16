#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const util = require('node:util');

// Logging function. Set NODE_DEBUG=CTMS to see debug log.
// In PowerShell:
// $Env:NODE_DEBUG = "CTMS"
let log = util.debuglog('CTMS', fn => {
  log = fn;
});

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
// Port defaults to undefined, AKA, protocol default
let port = undefined;

// Parse command line arguments

for (let idx = 2; idx < process.argv.length; idx++) {
  const arg = process.argv[idx];
  if (arg == '--protocol' || arg == '--hostname' || arg == '--wrappers' || arg == '--port') {
    idx++;
    if (idx < process.argv.length) {
      const value = process.argv[idx];
      if (arg == '--protocol') {
        protocol = value;
      } else if (arg == '--hostname') {
        hostname = value;
      } else if (arg == '--port') {
        port = parseInt(value);
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
  const reqPort = options.port ?? options.defaultPort ?? (protocol === 'https' ? 443 : 80);
  return new Promise((resolve, reject) => {
    const request = http.request(options, res => {
      log(
        'Received response HTTP %d %s for %s://%s:%d%s',
        res.statusCode,
        res.statusMessage,
        protocol,
        options.hostname,
        reqPort,
        options.path
      );
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
            log('Error: no Location header in %d %s redirect', res.statusCode, res.statusMessage);
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
            log('Error: redirecting from %s to %s changes protocol', protocol, location.protocol);
            reject(new Error(`Not redirecting from ${protocol} to ${location.protocol} for these tests`));
            return;
          }
          options.hostname = location.hostname;
          options.port = location.port ? location.port : reqPort;
          options.path = location.pathname;
          log('Redirecting to %s://%s:%d/%s', protocol, options.hostname, options.port, options.path);
          // And then send the redirect
          res.on('data', chunk => {
            log('Redirect data chunk (%d bytes)', chunk.length);
          });
          res.on('error', error => {
            log('Error raised while reading redirect response: %o', error);
          });
          res.on('end', () => {
            log('Redirect request completed.');
            resolve(invokeRestMethod(options, body));
          });
          return;
        }
        // Otherwise, fall through to gather the body
      }
      const responseBody = [];
      res.on('data', chunk => {
        log('Data chunk (%d bytes)', chunk.length);
        responseBody.push(chunk);
      });
      res.on('error', error => {
        log('Error raised while reading response: %o', error);
      });
      res.on('end', () => {
        log('Request completed.');
        const bodyStr = responseBody.join('');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(bodyStr);
        } else {
          reject(new ServerErrorException(`HTTP ${res.statusCode} ${res.statusMessage} from server`, res, bodyStr));
        }
      });
    });
    request.on('error', error => {
      log('Request failed: %o', error);
      reject(error);
    });
    if (body) {
      request.write(body);
    }
    request.end();
    request.on('end', () => {
      log(
        '%s request to %s://%s:%d%s ended.',
        options.method ?? 'GET',
        protocol,
        options.hostname,
        reqPort,
        options.path
      );
    });
    log(
      'Sending %s request to %s://%s:%d%s',
      options.method ?? 'GET',
      protocol,
      options.hostname,
      reqPort,
      options.path
    );
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
    // FIXME: Merge in any extra wrappers in wrappers.local.json
  }
  console.log(`Running tests against ${protocol}://${hostname}/...`);
  console.log('-- Testing Frontend app --');
  try {
    testStart('Sending basic "up and running" test...');
    const result = await invokeRestMethod({
      port: port,
      path: '/',
    });
    // TODO: Check the result
    testPassed();
  } catch (ex) {
    testFailed(ex);
  }

  let successCount = 0,
    failCount = 0;
  for (const wrapper of wrappers) {
    console.log(`-- Testing ${wrapper} --`);
    try {
      testStart('Sending basic "up and running" test...');
      let result = await invokeRestMethod({
        port: port,
        path: '/' + wrapper,
      });
      if (result == 'Hello from the Clinical Trial Matching Service') {
        successCount++;
        testPassed();
      } else {
        failCount++;
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
            successCount++;
            testPassed();
            console.log(`  Received ${result.total} results`);
          } else {
            failCount++;
            testPassed('Unexpected response from wrapper: not a FHIR bundle.');
            console.log('Server responsed with: %j', result);
          }
        } catch (ex) {
          failCount++;
          testPassed(`Failed to parse result: ${ex.toString()}`);
        }
      } catch (ex) {
        failCount++;
        testFailed(ex);
        console.log(
          '  The wrapper is running, this failure may be caused by the backend itself and not the CTMS software.'
        );
      }
    } catch (ex) {
      failCount++;
      testFailed(ex);
    }
  }
  const total = successCount + failCount;
  console.log(
    `Ran ${total} tests, ${successCount} succeeded (${total > 0 ? Math.round((successCount / total) * 100) : 0}%).`
  );
  const handles = process.getActiveResourcesInfo();
  log('runTests() completed. Open handles: %o', handles);
  const unexpectedHandles = handles.filter(handle => handle != 'TTYWrap');
  if (unexpectedHandles.length > 0) {
    console.error('Unexpected handles still open! Handles left open: %s', unexpectedHandles.join(', '));
  }
}
runTests()
  .then(() => {
    // Do nothing
    log('Test script promise resolved.');
  })
  .catch(error => {
    console.error('Running tests failed!');
    console.error('This is likely an error in the test script itself.');
    console.error(error);
  });
