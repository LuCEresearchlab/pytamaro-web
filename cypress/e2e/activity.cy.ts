describe('Activity Page', () => {
  it('should hide teacher-only cells', () => {
    cy.visit('/activities/luce/color-flower/en/v2');

    // only 2 visible cells
    cy.get('.ace_editor').should('have.length', 2);

    // visible cells contain keyword "pass"
    cy.get('.ace_content').each(($cell) => {
      cy.wrap($cell).within(() => {
        cy.get('.ace_keyword').contains('pass').should('have.length.at.least', 1);
      });
    });
  });
});
