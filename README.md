# clinical-trial-matching-app

## Requirements

- [Node.js](https://nodejs.org/en/download/) (LTS edition, currently 16.x)
- [Yarn](https://yarnpkg.com/en/docs/install) (1.22 or above)

## Testing with a launcher

1. Run `yarn install` to install the necessary packages.
2. Run `yarn start` to start the application.
3. Launch the application from the SMART launcher.
   - Visit [SMART Launcher](http://launch.smarthealthit.org/?auth_error=&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=http%3A%2F%2Flocalhost%3A3200%2Flaunch&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&sde=&sim_ehr=0&token_lifetime=15&user_pt=)
   - Launch `http://localhost:3200/launch`
     - Ensure that the "Simulate launch within the EHR user interface" option is disabled as local development is unable to set cookies in an iframe over plain http
   - Select a practitioner and a patient
   - Page will load with name of selected patient displayed

## Uploading test patients to the public SMART sandbox

Testing this SMART App is more meaningful when we can supply test patients that exercise various aspects of the application. Test patients are represented as FHIR R4 bundles at `src/utils/r4_test_patients`. To upload the test patients to the public SMART sandbox:

1. Add FHIR R4 Patient Bundles at `src/utils/r4_test_patients/`; e.g. [mCODE R1 STU1](http://hl7.org/fhir/us/mcode/STU1/index.html), US Core, etc. Two example mCODE Patient Bundles are provided.
2. Run `yarn upload-test-patients` or `yarn upload-test-patients:dump`.
   - Result of running either command:
     - The HTTP status response codes of each input Patient Bundle and its entries are printed to the command-line. A `200 OK` code indicates a successful upload. A `201 Created` code indicates successful upload for the first time. A `400 Bad Request` indicates an unsuccessful upload, and a diagnostic message is printed out for further troubleshooting.
   - Additional result of running the latter command:
     - Each inputted Patient Bundle is split into two separate Resources: a Patient and a Bundle containing the remaining Resources. The script then creates an untracked directory, `/test_patient_dump/R4/`, and populates it with the pairs of Resources. This directory is useful for development or upload troubleshooting purposes.

## Running tests

Tests can be run by executing:

```
yarn test
```

## Running the code linter

Code liniting can be run by executing:

```
yarn lint
```

Some issues can be automatically corrected with:

```
yarn lint:js --fix
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
