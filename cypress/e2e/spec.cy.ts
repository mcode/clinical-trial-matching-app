describe('Load the app', () => {
  it('Launches the app through the SMART App Launcher', () => {
    const MOONSHOT_DEV_SERVER_URL =
      'http://moonshot-dev.mitre.org:4001/?auth_error=&fhir_version_1=r2&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=http%3A%2F%2Flocalhost%3A3200%2Flaunch&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&sb=&sde=%E2%88%BCehr&sim_ehr=0&token_lifetime=15&user_pt=';
    const SMART_HEALTH_IT_SERVER_URL =
      'http://launch.smarthealthit.org/?auth_error=&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=http%3A%2F%2Flocalhost%3A3200%2Flaunch&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&sde=&sim_ehr=0&token_lifetime=15&user_pt=';

    const APP_URL = 'http://localhost:3200';

    // cy.visit(MOONSHOT_DEV_SERVER_URL);
    cy.visit(SMART_HEALTH_IT_SERVER_URL);
    cy.get('#ehr-launch-url').invoke('removeAttr', 'target').click();
    cy.get('button').click();
    cy.get('.patient').first().click();

    cy.origin(APP_URL, () => {
      cy.get('input[name="zipcode"]').type('02021');
    });
  });
});
