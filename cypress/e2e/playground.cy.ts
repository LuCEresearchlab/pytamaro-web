import {
  dismissDataCollectionModal,
  waitForMonacoEditor,
} from '../support/utils';

export {};

describe('Playground Page', () => {
  beforeEach(() => {
    cy.visit('/playground');
  });

  it('should contain 1 card with at least 1 line', () => {
    cy.get('.MuiCard-root').should('have.length', 1);
    cy.get('.view-line').should('have.length.at.least', 2);
  });

  it('should allow sharing a link to the current code', () => {
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    const code = 'print("Shared!")';
    cy.get('.monaco-editor').first().type(code);
    // The share button is currently 1s debounced because it takes data from window.location.
    // Ideally, clicking the share button would immediately reflect the latest code.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // https://github.com/cypress-io/cypress/issues/18198
    cy.get('[data-testid="share-button"]').focus();
    cy.get('[data-testid="share-button"]').dblclick();

    cy.window()
      .then((win) => win.navigator.clipboard.readText())
      .then((url) => {
        // Clear the editor
        cy.get('.monaco-editor')
          .first()
          .type('{selectall}{backspace}gibberish');
        cy.get('.monaco-editor').first().should('not.contain.text', code);
        // Expect the content to be back after visiting the shared URL
        cy.visit(url);
        cy.contains('button', 'replace my code').click();
        cy.get('.monaco-editor').first().should('contain.text', code);
      });
  });
});
