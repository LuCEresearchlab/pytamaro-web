import { activityVariantPathname } from '../../src/urlUtils';

export {};

describe('Activity Page', () => {
  it('should hide teacher-only cells', () => {
    cy.visit(activityVariantPathname('luce', 'color-flower', 'en', 'v2'));

    // only 2 visible cells
    cy.get('.monaco-editor').should('have.length', 2);

    // visible cells contain keyword "pass"
    cy.get('.lines-content').each(($cell) => {
      cy.wrap($cell).within(() => {
        cy.get('.mtk6').contains('pass').should('have.length.at.least', 1);
      });
    });
  });
});
