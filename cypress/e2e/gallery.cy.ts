export {};

describe('Gallery Page', () => {
  it('should contain at least 1 card', () => {
    cy.visit('/activities/luce');

    // at least 1 card
    cy.get('.MuiCard-root').should('have.length.at.least', 1);
  });
});
