import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/queries/clinicalTrialPaginationQuery';
import * as searchServerSideProps from '../fixtures/searchServerSideProps.json';

const containsEveryExpectedItem = (arr: string[]) => () =>
  cy.get(`[role="button"]`).each((item, index) => cy.wrap(item).contains(arr[index]));

const hasText = (value: string) => () => cy.get(`input[type="text"]`).should('have.value', value);

const hasNumber = (value: number) => () => cy.get(`input[type="number"]`).should('have.value', value);

const isEmpty = () => cy.get(`input[type="text"]`).should('be.empty');

describe('Tests the results page', () => {
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

  const queryParameters = () => {
    const ageParam = `age=${patient.age}`;
    const genderParam = `gender=${patient.gender}`;
    const cancerTypeParam = `cancerType=${encodeURIComponent(
      JSON.stringify(primaryCancerCondition.cancerType || null)
    )}`;
    const cancerSubtypeParam = `cancerSubtype=${encodeURIComponent(
      JSON.stringify(primaryCancerCondition.cancerSubtype || '')
    )}`;
    const stageParam = `stage=${primaryCancerCondition.stage}`;
    const travelDistanceParam = `travelDistance=100`;
    const zipcodeParam = `zipcode=${patient.zipcode}`;
    const metastasisParam = `metastasis=${metastasis.join('&metastasis=')}`;
    const ecogScoreParam = `ecogScore=${ecogScore}`;
    const karnofskyScoreParam = `karnofskyScore=${karnofskyScore}`;
    const biomarkerParam = `biomarkers=${biomarkers.join('&biomarkers=')}`;
    const radiationParam = `radiation=${radiation.join('&radiation=')}`;
    const surgeryParam = `surgery=${surgery.join('&surgery=')}`;
    const medicationsParam = `medications=${medications.join('&medications=')}`;
    const sortingOptionParam = `sortingOption=matchLikelihood`;
    const pageParam = `page=${DEFAULT_PAGE}`;
    const pageSizeParam = `pageSize=${DEFAULT_PAGE_SIZE}`;
    return [
      ageParam,
      genderParam,
      cancerTypeParam,
      cancerSubtypeParam,
      stageParam,
      travelDistanceParam,
      zipcodeParam,
      metastasisParam,
      ecogScoreParam,
      karnofskyScoreParam,
      biomarkerParam,
      radiationParam,
      surgeryParam,
      medicationsParam,
      sortingOptionParam,
      pageParam,
      pageSizeParam,
    ].join('&');
  };

  beforeEach(() => {
    cy.viewport('macbook-16');
  });

  it('can render a study with no closest facilities', () => {
    cy.intercept('/api/clinical-trial-search', { fixture: 'resultDetailsWithInvalidZipcode.json' });
    cy.visit(`/results?${queryParameters()}`, { failOnStatusCode: false });

    const trialId = 'NCT02488967';
    cy.get(`#results-header-${trialId}`).click();
    cy.get(`#study-${trialId}-header`).click();
    cy.contains(/no closest facilities/i);
  });

  it.only('has clickable pagination', () => {
    cy.intercept('/api/clinical-trial-search', { fixture: 'resultDetailsWithValidZipcode.json' });
    cy.visit(`/results?${queryParameters()}`, { failOnStatusCode: false });

    // Can navigate to second page
    cy.get('[data-testid="NavigateNextIcon"]').click();

    // Can navigate to last page
    cy.get('[data-testid="LastPageIcon"]').click();
  });

  it('Tests that there are studies with closest facilities on the results page', () => {
    cy.intercept('/api/clinical-trial-search', { fixture: 'resultDetailsWithValidZipcode.json' });
    cy.visit(`/results?${queryParameters()}`, { failOnStatusCode: false });

    // Change patient zipcode to valid one, like 02215
    cy.get('[data-testid="ExpandMoreIcon"]').first().wait(1000).click();
    cy.get('[data-testid="zipcode"]').clear().type('02215');
    cy.get('button[type="submit"]')
      .contains(/search/i)
      .click();

    // Check patient zipcode has changed
    cy.get('[data-testid="ExpandMoreIcon"]').first().wait(1000).click();
    cy.get('[data-testid="zipcode"]').within(hasText('02215'));

    // Change travel radius to 1 mile
    cy.get('[data-testid="travelDistance"]').clear().type('1');
    cy.get('button[type="submit"]')
      .contains(/search/i)
      .click();
    cy.get('[data-testid="ExpandMoreIcon"]').first().wait(1000).click();
    cy.get('[data-testid="travelDistance"]').within(hasText('1'));

    // show that the intitial results are loaded in (no distance)
    // 1. distance/match likelihood will show same results for zipcode 11111
    // 2. saved status will work by showing the saved studies up top
    // 3. expand accordion
    // 4. show we get a 200 response from clicking More Info button
    // 5. save/unsave study with accordion header button, then with accordion body button
    // 6. click show more button (for study with multiple tags)
    // 7. compare the study detail props with how they're presented on the study? maybe check the first one?
    // 8. compare contents of Exported Excel sheet in cypress/downloads/clinicalTrials.xlsx?
    // 9.
    // TODO: bug where the top 5 closest facilities are listed (but empty) for an invalid patient zipcode
  });
});
