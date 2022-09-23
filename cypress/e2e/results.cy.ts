import { FullSearchParameters } from 'types/search-types';
import defaultSearchParameters from '../fixtures/resultsSearchParams.json';
import differentTravelDistanceAndPage from '../fixtures/resultsSearchParamsWithDifferentPageAndWithoutTravelDistance.json';
import differentTravelDistance from '../fixtures/resultsSearchParamsWithoutTravelDistance.json';
import differentSavedStudies from '../fixtures/resultsSearchParamsWithSavedStudies.json';

const hasNumber = (value: number | string) => () => cy.get(`input[type="number"]`).should('have.value', value);

const queryParameters = (overridingParameters?: Partial<FullSearchParameters>): string => {
  const convertParameters = (parameters: FullSearchParameters): string =>
    Object.keys(parameters)
      .map((key: string) =>
        Array.isArray(parameters[key])
          ? parameters[key].map((entry: string) => `${key}=${entry}`)
          : `${key}=${parameters[key]}`
      )
      .flat()
      .join('&');

  return overridingParameters
    ? convertParameters({ ...defaultSearchParameters, ...overridingParameters })
    : convertParameters(defaultSearchParameters);
};

describe('/results', () => {
  beforeEach(() => {
    cy.viewport('macbook-16');
  });

  it('can render a study with no closest facilities', () => {
    const trialId = 'NCT02488967';
    cy.intercept('/api/clinical-trial-search', { fixture: 'resultDetailsWithInvalidZipcode.json' });
    cy.visit(`/results?${queryParameters()}`, { failOnStatusCode: false });
    cy.get(`#results-header-${trialId}`).click();
    cy.get(`#study-${trialId}-header`).click();
    cy.contains(/no closest facilities/i);
  });

  describe('has working pagination', () => {
    beforeEach(() => {
      cy.intercept('/api/clinical-trial-search', { fixture: 'resultDetailsWithValidZipcode.json' });
    });

    context('without specified travel distance and with different starting page', () => {
      beforeEach(() => {
        cy.visit(`/results?${queryParameters(differentTravelDistanceAndPage)}`, { failOnStatusCode: false });
      });

      it('can navigate to the previous page', () => {
        cy.get('[data-testid="NavigateBeforeIcon"]').click();
      });

      it('can navigate to the first page', () => {
        cy.get('[data-testid="FirstPageIcon"]').click();
        cy.get('[data-testid="NavigateBeforeIcon"]').parent().should('be.disabled');
      });
    });

    context('without specified travel distance', () => {
      beforeEach(() => {
        cy.visit(`/results?${queryParameters(differentTravelDistance)}`, { failOnStatusCode: false });
      });

      it('can navigate to the next page', () => {
        cy.get('[data-testid="NavigateNextIcon"]').click();
      });

      it('can navigate to the last page', () => {
        cy.get('[data-testid="LastPageIcon"]').click();
        cy.get('[data-testid="NavigateNextIcon"]').parent().should('be.disabled');
      });

      it('can navigate to a numbered page other than self', () => {
        cy.get('[data-testid="pagination"]').contains('2').click();
      });

      it('closes the page size modal when the current page size is selected', () => {
        cy.get('[data-testid="tablePagination"]').find('[data-testid="ArrowDropDownIcon"]').parent().click();
        cy.get('[data-value="10"]').click();
      });

      it('produces the correct amount of pages for a page size of 10', () => {
        cy.get('[data-testid="NavigateBeforeIcon"]').parent().should('be.disabled');
        cy.wrap(Array.from({ length: 5 })).each(() => cy.get('[data-testid="NavigateNextIcon"]').click());
        cy.get('[data-testid="NavigateNextIcon"]').parent().should('be.disabled');
      });

      it('produces the correct amount of pages for a page size of 25', () => {
        cy.get('[data-testid="tablePagination"]').find('[data-testid="ArrowDropDownIcon"]').parent().click();
        cy.get('[data-value="25"]').click();
        cy.get('[data-testid="NavigateBeforeIcon"]').parent().should('be.disabled');
        cy.wrap(Array.from({ length: 2 })).each(() => cy.get('[data-testid="NavigateNextIcon"]').click());
        cy.get('[data-testid="NavigateNextIcon"]').parent().should('be.disabled');
      });

      it('produces the correct amount of pages for a page size of 50', () => {
        cy.get('[data-testid="tablePagination"]').find('[data-testid="ArrowDropDownIcon"]').parent().click();
        cy.get('[data-value="50"]').click();
        cy.get('[data-testid="NavigateBeforeIcon"]').parent().should('be.disabled');
        cy.get('[data-testid="NavigateNextIcon"]').click();
        cy.get('[data-testid="NavigateNextIcon"]').parent().should('be.disabled');
      });
    });
  });

  it('can filter studies by travel radius', () => {
    cy.intercept('/api/clinical-trial-search', { fixture: 'resultDetailsWithValidZipcode.json' });
    cy.visit(`/results?${queryParameters(differentTravelDistance)}`, { failOnStatusCode: false });

    cy.contains(/60 matching trials/i);

    // Change patient zipcode to valid one, like 02215
    cy.get('[data-testid="ExpandMoreIcon"]').first().click();
    cy.get('[data-testid="zipcode"]').clear().type('02215');

    // Change travel radius to 2 miles
    cy.get('[data-testid="travelDistance"]').clear().type('2');

    // Trigger new distance-filter query
    cy.get('button[type="submit"]')
      .contains(/search/i)
      .click();

    // Check patient zipcode and travel distance have changed
    cy.get('[data-testid="ExpandMoreIcon"]').first().click();
    cy.get('[data-testid="zipcode"]').within(hasNumber('02215'));
    cy.get('[data-testid="travelDistance"]').within(hasNumber(2));

    cy.contains(/3 matching trials/i);
  });

  describe('has working study saving functionality', () => {
    beforeEach(() => {
      cy.intercept('/api/clinical-trial-search', { fixture: 'resultDetailsWithValidZipcode.json' });
    });

    const savedStudies = ['NCT04266249', 'NCT04188548'];

    it('saves studies', () => {
      cy.visit(`/results?${queryParameters()}`, { failOnStatusCode: false });
      cy.url().should('not.include', savedStudies[0]).and('not.include', savedStudies[1]);

      // Save study via header button
      cy.get(`#results-header-${savedStudies[0]}`).within(() => cy.get('[data-testid="SaveIcon"]').click());

      // Save study via body button
      cy.get(`#results-header-${savedStudies[1]}`)
        .click()
        .next()
        .within(() => cy.get('[data-testid="SaveIcon"]').click());

      cy.contains(/filter$/i).click();
      cy.url().should('include', savedStudies[0]).and('include', savedStudies[1]);
    });

    it('unsaves studies', () => {
      cy.visit(`/results?${queryParameters(differentSavedStudies)}`, { failOnStatusCode: false });
      cy.url().should('include', savedStudies[0]).and('include', savedStudies[1]);

      // Unsave study via header button
      cy.get(`#results-header-${savedStudies[0]}`).within(() => cy.get('[data-testid="UnsaveIcon"]').click());

      // Unsave study via body button
      cy.get(`#results-header-${savedStudies[1]}`)
        .click()
        .next()
        .within(() => cy.get('[data-testid="UnsaveIcon"]').click());

      cy.contains(/filter$/i).click();
      cy.url().should('not.include', savedStudies[0]).and('not.include', savedStudies[1]);
    });

    it('sorts studies by saved status', () => {
      cy.visit(`/results?${queryParameters(differentSavedStudies)}`, { failOnStatusCode: false });

      // Assert the original positions of the studies before sorting by saved status
      cy.contains(/matching trials/i)
        .siblings()
        .then($siblings => {
          cy.wrap($siblings).eq(1).contains(savedStudies[0]);
          cy.wrap($siblings).eq(3).contains(savedStudies[1]);
        });

      // Click button only when it is enabled
      cy.wait(5000)
        .contains(/saved status/i)
        .click();

      cy.contains(/filter$/i).click();

      // Assert the studies were actually sorted by saved status
      cy.contains(/matching trials/i)
        .siblings()
        .then($siblings => {
          cy.wrap($siblings).eq(0).contains(savedStudies[0]);
          cy.wrap($siblings).eq(1).contains(savedStudies[1]);
        });
    });

    it('clears saved studies', () => {
      cy.visit(`/results?${queryParameters(differentSavedStudies)}`, { failOnStatusCode: false });
      cy.url().should('include', savedStudies[0]).and('include', savedStudies[1]);
      cy.contains(/clear saved trials/i).click();
      cy.contains(/filter$/i).click();
      cy.url().should('not.include', savedStudies[0]).and('not.include', savedStudies[1]);
    });
  });

  /*
  1. Sidebar sorting/filters - distance/match likelihood
  2. show we get a 200 response from clicking More Info button
  3. click show more button (for study with multiple tags)
  */

  it.only('filters by study attributes', () => {});

  it('opens up the NCT.gov page for a study when clicking the more info button', () => {});

  it('displays a modal when clicking the show more button', () => {});
});
