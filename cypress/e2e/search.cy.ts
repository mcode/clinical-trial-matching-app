import * as searchServerSideProps from '../fixtures/searchServerSideProps.json';

const containsEveryExpectedItem = (arr: string[]) => () =>
  cy.get(`[role="button"]`).each((item, index) => cy.wrap(item).contains(arr[index]));

const hasText = (value: string) => () => cy.get(`input[type="text"]`).should('have.value', value);

const hasNumber = (value: number) => () => cy.get(`input[type="number"]`).should('have.value', value);

const isEmpty = () => cy.get(`input[type="text"]`).should('be.empty');

beforeEach(() => {
  cy.viewport('macbook-16');

  // Skip the launch page since we are not loading data from the EHR
  cy.visit('/search', { failOnStatusCode: false });
});

describe('Tests the search page', () => {
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

  const selectedTravelDistance = '1';
  const selectedAge = '30';
  const selectedZipcode = '02215';
  const selectedCancerType = 'Sarcoma of breast (disorder)';
  const selectedCancerSubtype = 'Juvenile carcinoma of the breast (morphologic abnormality)';
  const selectedStage = 'II';
  const selectedEcogScore = '4';
  const selectedKarnofskyScore = '30';
  const selectedMetastasis = 'metastasis-2';
  const selectedMedication = 'medication-1';

  it('is populated with the mock matching services, user, and patient data', () => {
    cy.get('[data-testid="matchingServices"]').get('[name="matchingServices.service-1"]').should('not.be.checked');
    cy.get('[data-testid="matchingServices"]').get('[name="matchingServices.service-2"]').should('be.checked');

    cy.get('[data-testid="userName"]').contains(user.name);

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
  });

  it.only('selects different options for the fields on the search form', () => {
    cy.wait(1000);

    cy.get('[data-testid="matchingServices"]')
      .get('[name="matchingServices.service-2"]')
      .click()
      .should('not.be.checked'); // uncheck default matching service

    // TODO: clear zipcode and attempt to search, see if "Please fill out this field" appears?
    cy.get('[data-testid="zipcode"]').click().clear().type(selectedZipcode); // select zipcode by clearing and typing

    cy.get('[data-testid="travelDistance"').click().clear().type(selectedTravelDistance); // select travel distance by clearing and typing

    cy.get('[data-testid="age"]').type('{upArrow}{upArrow}{esc}'); // fail to select age with arrow keys and hitting escape

    cy.get('[data-testid="cancerType"]')
      .click()
      .get('.MuiAutocomplete-popper [role="listbox"]')
      .contains(selectedCancerType)
      .click(); // clicked cancer type option

    cy.get('[data-testid="cancerSubtype"]').type('juvenile{downArrow}{enter}'); // select option by typing and arrow keys and enter

    cy.get('[data-testid="stage"]')
      .click()
      .get('.MuiAutocomplete-popper [role="listbox"]')
      .contains(selectedStage)
      .click(); // clicked stage option

    cy.get('[data-testid="ecogScore"]').click().type('INVALID OPTION').should('not.contain', selectedEcogScore); // fail to select valid option and reset to default

    cy.get('[data-testid="karnofskyScore"]').type('{downArrow}{downArrow}{downArrow}{enter}'); // selected option with arrow keys and enter

    cy.get('[data-testid="metastasis"]')
      .click()
      .get('.MuiAutocomplete-popper [role="listbox"]')
      .contains(selectedMetastasis)
      .click(); // clicked metastasis option

    cy.get('[data-testid="biomarkers"]').click().find('[title="Clear"]').click(); // removed option by clicking on field X button

    cy.get('[data-testid="radiation"]').within(() => {
      cy.get(`[role="button"]`).find('[data-testid="CancelIcon"]').click();
    }); // removed option by clicking on pill X button

    cy.get('[data-testid="surgery"]').type('{leftArrow}{backspace}{backspace}'); // removed option with arrow keys and backspace

    cy.get('[data-testid="medications"]').type(`${selectedMedication}{enter}{downArrow}{downArrow}{enter}`); // removed option with arrow keys and enter
  });

  it('goes to the results page when the search button is clicked', () => {
    cy.intercept('/api/clinical-trial-search', { body: { results: [], error: [] } });
    cy.get('button[type="submit"]')
      .contains(/search/i)
      .click();
  });
});
