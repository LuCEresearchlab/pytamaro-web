import { dismissDataCollectionModal } from '../support/utils';

export {};

describe('Evaluator Page', () => {
  it('should keep the code in a compressed URL and load it back', () => {
    cy.visit('/evaluator');
    dismissDataCollectionModal();
    cy.get('.monaco-editor').first().should('be.visible');

    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    const code = 'print("Evaluated!")';
    cy.get('.monaco-editor').first().type(code);

    // The URL is updated after a debounce.
    cy.url().should('include', 'c=');
    cy.url().then((url) => {
      cy.get('.monaco-editor').first().type('{selectall}{backspace}gibberish');
      cy.get('.monaco-editor').first().should('not.contain.text', code);

      cy.visit(url);
      cy.contains('button', 'replace my code').click();
      cy.get('.monaco-editor').first().should('contain.text', code);
    });
  });
});
