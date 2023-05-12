export {};

describe('Playground Page', () => {
  beforeEach(() => {
    cy.visit('/playground');
  });

  it('should contain 1 card with at least 1 line', () => {
    cy.get('.MuiCard-root').should('have.length', 1);
    cy.get('.view-line').should('have.length.at.least', 2);
  });
});
