import * as searchServerSideProps from '../fixtures/searchServerSideProps.json';

const hasEveryExpectedItem = (arr: string[]) => () =>
  cy
    .get(`[role="button"]`)
    .each((item, index) => cy.wrap(item).contains(arr[index]))
    .should('exist');

const hasNoItems = () => cy.get(`[role="button"]`).should('not.exist');

const hasText = (value: string) => () => cy.get(`input[type="text"]`).should('have.value', value);

const hasNumber = (value: number) => () => cy.get(`input[type="number"]`).should('have.value', value);

const textIsEmpty = () => cy.get(`input[type="text"]`).should('be.empty');

const numberIsEmpty = () => cy.get(`input[type="number"]`).should('be.empty');

beforeEach(() => {
  cy.viewport('macbook-16');
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
  const selectedZipcode = '02215';
  const selectedCancerType = 'Sarcoma of breast (disorder)';
  const selectedCancerSubtype = 'Juvenile carcinoma of the breast (morphologic abnormality)';
  const selectedStage = 'II';
  const selectedKarnofskyScore = '20';
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
    cy.get('[data-testid="cancerSubtype"]').within(textIsEmpty);
    cy.get('[data-testid="stage"]').within(hasText(primaryCancerCondition.stage));
    cy.get('[data-testid="ecogScore"]').within(hasText(ecogScore));
    cy.get('[data-testid="karnofskyScore"]').within(hasText(karnofskyScore));
    cy.get('[data-testid="metastasis"]').within(hasEveryExpectedItem(metastasis));
    cy.get('[data-testid="biomarkers"]').within(hasEveryExpectedItem(biomarkers));
    cy.get('[data-testid="radiation"]').within(hasEveryExpectedItem(radiation));
    cy.get('[data-testid="surgery"]').within(hasEveryExpectedItem(surgery));
    cy.get('[data-testid="medications"]').within(hasEveryExpectedItem(medications));
  });

  it('is not submitted without zipcode', () => {
    cy.get('input:invalid').should('have.length', 0);

    cy.get('[data-testid="zipcode"]').click().clear();
    cy.get('[type="submit"]').click();
    cy.get('input:invalid').should('have.length', 1);

    cy.get('[data-testid="zipcode"]').within(() => {
      cy.get('[type="text"]').then($input => {
        expect(($input[0] as HTMLObjectElement).validationMessage).to.eq('Please fill out this field.');
      });
    });
  });

  it('selects different options for the fields on the search form', () => {
    cy.wait(1000);

    // Uncheck default matching service
    cy.get('[data-testid="matchingServices"]')
      .get('[name="matchingServices.service-2"]')
      .click()
      .should('not.be.checked');

    // Select zipcode by clearing and typing
    cy.get('[data-testid="zipcode"]').click().clear().type(selectedZipcode).within(hasText(selectedZipcode));

    // Select travel distance by clearing and typing
    cy.get('[data-testid="travelDistance"')
      .click()
      .clear()
      .type(selectedTravelDistance)
      .within(hasText(selectedTravelDistance));

    // Fail to input non-number for age
    cy.get('[data-testid="age"]').clear().type('abc').within(numberIsEmpty);

    // Select cancer type option by clicking
    cy.get('[data-testid="cancerType"]')
      .click()
      .get('.MuiAutocomplete-popper [role="listbox"]')
      .contains(selectedCancerType)
      .click();
    cy.get('[data-testid="cancerType"]').within(hasText(selectedCancerType));

    // Select option by typing and arrow keys and enter
    cy.get('[data-testid="cancerSubtype"]').type('juvenile{downArrow}{enter}').within(hasText(selectedCancerSubtype));

    // Clicked stage option
    cy.get('[data-testid="stage"]')
      .click()
      .get('.MuiAutocomplete-popper [role="listbox"]')
      .contains(selectedStage)
      .click();
    cy.get('[data-testid="stage"]').within(hasText(selectedStage));

    // Fail to select valid option and reset to default
    cy.get('[data-testid="ecogScore"]').click().type('INVALID OPTION');
    cy.contains('No options').should('exist');

    // Selected option with arrow keys and enter
    cy.get('[data-testid="karnofskyScore"]')
      .type('{downArrow}{downArrow}{downArrow}{enter}')
      .within(hasText(selectedKarnofskyScore));

    // Clicked metastasis option
    cy.get('[data-testid="metastasis"]')
      .click()
      .get('.MuiAutocomplete-popper [role="listbox"]')
      .contains(selectedMetastasis)
      .click();
    cy.get('[data-testid="metastasis"]').within(hasEveryExpectedItem([...metastasis, selectedMetastasis]));

    // Removed option by clicking on field X button
    cy.get('[data-testid="biomarkers"]').click().find('[title="Clear"]').click();
    cy.get('[data-testid="biomarkers"]').within(hasNoItems);

    // Removed option by clicking on pill X button
    cy.get('[data-testid="radiation"]').within(() =>
      cy.get(`[role="button"]`).find('[data-testid="CancelIcon"]').click()
    );
    cy.get('[data-testid="radiation"]').within(hasNoItems);

    // Removed option with arrow keys and backspace
    cy.get('[data-testid="surgery"]').type('{leftArrow}{backspace}{backspace}');
    cy.get('[data-testid="surgery"]').within(hasEveryExpectedItem([surgery[0], surgery[1]]));

    // Removed option with arrow keys and enter
    cy.get('[data-testid="medications"]').type(`${selectedMedication}{enter}{downArrow}{downArrow}{enter}`);
    cy.get('[data-testid="medications"]').within(hasEveryExpectedItem(medications));
  });

  it('goes to the results page when the search button is clicked', () => {
    cy.intercept('/api/clinical-trial-search', { body: { results: [], error: [] } });
    cy.get('button[type="submit"]')
      .contains(/search/i)
      .click();
  });
});
