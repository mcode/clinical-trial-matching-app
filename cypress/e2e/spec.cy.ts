import * as searchServerSideProps from '../fixtures/searchServerSideProps.json';
describe('Tests the end-to-end functionality of the app', () => {
  const APP_URL = 'http://localhost:3200';

  beforeEach(() => {
    cy.viewport('macbook-16');
  });

  it('Tests the search page', () => {
    const containsEveryExpectedItem = (arr: string[]) => () =>
      cy.get(`[role="button"]`).each((item, index) => cy.wrap(item).contains(arr[index]));
    const hasText = (value: string) => () => cy.get(`input[type="text"]`).should('have.value', value);
    const hasNumber = (value: number) => () => cy.get(`input[type="number"]`).should('have.value', value);
    const isEmpty = () => cy.get(`input[type="text"]`).should('be.empty');
    const selectedCancerSubtype = 'Juvenile carcinoma of the breast (morphologic abnormality)';

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
    } = searchServerSideProps.props;

    // Skip the launch page since we are not loading data from the EHR

    cy.visit(`${APP_URL}/search`);

    // At least one matching service is checked
    cy.get('[data-testid="matchingServices"]').get('[name="matchingServices.breastCancerTrials"]').should('be.checked');

    // Mock user was loaded in
    cy.get('[data-testid="userName"]').contains(user.name);

    // Mock patient record was loaded in
    cy.get('[data-testid="patientName"]').contains(patient.name);
    cy.get('[data-testid="patientGender"]').contains(patient.gender);
    cy.get('[data-testid="patientAge"]').contains(patient.age);
    cy.get('[data-testid="zipcode"]').within(hasText(patient.zipcode));
    cy.get('[data-testid="age"]').within(hasNumber(Number(patient.age)));
    cy.get('[data-testid="cancerType"]').within(hasText(primaryCancerCondition.cancerType.display));
    cy.get('[data-testid="cancerSubtype"]').within(isEmpty);
    cy.get('[data-testid="stage"]').within(hasText(primaryCancerCondition.stage));
    cy.get('[data-testid="ecogScore"]').within(hasText(ecogScore));
    cy.get('[data-testid="karnofskyScore"]').within(hasText(karnofskyScore));
    cy.get('[data-testid="metastasis"]').within(containsEveryExpectedItem(metastasis));
    cy.get('[data-testid="biomarkers"]').within(containsEveryExpectedItem(biomarkers));
    cy.get('[data-testid="radiation"]').within(containsEveryExpectedItem(radiation));
    cy.get('[data-testid="surgery"]').within(containsEveryExpectedItem(surgery));
    cy.get('[data-testid="medications"]').within(containsEveryExpectedItem(medications));

    // Select cancer subtype
    cy.scrollTo(0, 100);
    cy.get('[data-testid="cancerSubtype"]')
      .click()
      .get('.MuiAutocomplete-popper [role="listbox"]')
      .contains(selectedCancerSubtype)
      .click();
    cy.get('[data-testid="cancerSubtype"]').within(hasText(selectedCancerSubtype));

    // Click search
    cy.get('button[type="submit"]')
      .contains(/search/i)
      .click();
    // cy.submit('form');

    // Check that the following query parameters were populated from the search form?
  });
});
