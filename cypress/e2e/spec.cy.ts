describe('Load the app', () => {
  it('passes', () => {
    cy.visit(
      'http://moonshot-dev.mitre.org:4001/?auth_error=&fhir_version_1=r2&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=http%3A%2F%2Flocalhost%3A3200%2Flaunch&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&sb=&sde=%E2%88%BCehr&sim_ehr=0&token_lifetime=15&user_pt='
    );
    cy.visit(
      'http://localhost:3200/launch?launch=eyJhIjoiMSJ9&iss=http%3A%2F%2Fmoonshot-dev.mitre.org%3A4001%2Fv%2Fr4%2Ffhir'
    );
    // cy.get('#ehr-launch-url').click();
    cy.get('button').click();
    cy.get('.patient').first().click();
  });
});
