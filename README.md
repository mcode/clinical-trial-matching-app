# clinical-trial-matching-app

## Testing with a launcher

1. Run `yarn install` to install the necessary packages.
2. Run `yarn start` to start the application.
3. Launch the application from the SMART launcher.
    - Visit [SMART Launcher](http://launch.smarthealthit.org/?auth_error=&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=http%3A%2F%2Flocalhost%3A3200%2Flaunch&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&sde=&sim_ehr=0&token_lifetime=15&user_pt=)
    - Launch `http://localhost:3200/launch`
      - Ensure that the "Simulate launch within the EHR user interface" option is disabled as local development is unable to set cookies in an iframe over plain http
    - Select a practitioner and a patient
    - Page will load with name of selected patient displayed
    
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

