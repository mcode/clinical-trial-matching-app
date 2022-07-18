describe('Loads the app', () => {
  // const MOONSHOT_DEV_SERVER_URL =
  //   'http://moonshot-dev.mitre.org:4001/?auth_error=&fhir_version_1=r2&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=http%3A%2F%2Flocalhost%3A3200%2Flaunch&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&sb=&sde=%E2%88%BCehr&sim_ehr=0&token_lifetime=15&user_pt=';
  const SMART_HEALTH_IT_SERVER_URL =
    'http://launch.smarthealthit.org/?auth_error=&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=http%3A%2F%2Flocalhost%3A3200%2Flaunch&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&sde=&sim_ehr=0&token_lifetime=15&user_pt=';
  const APP_URL = 'http://localhost:3200';

  it('Launches the app through the SMART App Launcher', () => {
    cy.visit(SMART_HEALTH_IT_SERVER_URL);
    cy.get('#ehr-launch-url').invoke('removeAttr', 'target').click();
    cy.get('button').click();
    cy.get('.patient').first().click();

    // Loads the search form
    cy.origin(APP_URL, () => {
      cy.fixture('searchServerSideProps').then(({ props }) => {
        const {
          patient,
          user,
          primaryCancerCondition,
          metastasis,
          ecogScore,
          karnofskyScore,
          biomarkers,
          radiation,
          surgery,
          medications,
        } = props;

        const selectedCancerSubtype = 'Juvenile carcinoma of the breast (morphologic abnormality)';

        // See that at least one matching service is checked
        cy.get('[data-testid="matchingServices"]')
          .get('[name="matchingServices.breastCancerTrials"]')
          .should('be.checked');

        // Check patient record was loaded in
        cy.get('p').contains(patient.name).contains(patient.gender).contains(patient.age);
        cy.get('[data-testid="zipcode"]').within(() =>
          cy.get(`input[type="text"]`).should('have.value', patient.zipcode)
        );
        cy.get('[data-testid="age"]').within(() => cy.get(`input[type="number"]`).should('have.value', patient.age));
        cy.get('[data-testid="cancerType"]').within(() =>
          cy.get(`input[type="text"]`).should('have.value', primaryCancerCondition.cancerType)
        );
        cy.get('[data-testid="cancerSubtype"]').within(() =>
          cy.get(`input[type="text"]`).should('have.value', primaryCancerCondition.cancerSubtype)
        );
        cy.get('[data-testid="stage"]').within(() =>
          cy.get(`input[type="text"]`).should('have.value', primaryCancerCondition.stage)
        );
        cy.get('[data-testid="ecogScore"]').within(() => cy.get(`input[type="text"]`).should('have.value', ecogScore));
        cy.get('[data-testid="karnofskyScore"]').within(() =>
          cy.get(`input[type="text"]`).should('have.value', karnofskyScore)
        );
        cy.get('[data-testid="metastasis"]').within(() => cy.get(`[role="button"]`).contains(metastasis[0]));
        cy.get('[data-testid="biomarkers"]').within(() => cy.get(`[role="button"]`).contains(biomarkers[0]));
        cy.get('[data-testid="radiation"]').within(() => cy.get(`[role="button"]`).contains(radiation[0]));
        cy.get('[data-testid="surgery"]').within(() => cy.get(`[role="button"]`).contains(surgery[0]));
        cy.get('[data-testid="medications"]').within(() => cy.get(`[role="button"]`).contains(medications[0]));

        // Select cancer subtype
        cy.scrollTo(0, 100);
        cy.get('[data-testid="cancerSubtype"]')
          .click()
          .get('.MuiAutocomplete-popper [role="listbox"]')
          .contains(selectedCancerSubtype)
          .click();
        cy.get('[data-testid="cancerSubtype"]').within(() =>
          cy.get(`input[type="text"]`).should('have.value', selectedCancerSubtype)
        );
      });
    });
  });
});
