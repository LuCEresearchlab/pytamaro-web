import { evaluatorPathname } from '../../src/urlUtils';
import {
  dismissDataCollectionModal,
  typeMonacoCode,
  waitForMonacoEditor,
} from '../support/utils';

export {};

describe('Evaluator Page', () => {
  it('should keep the code in a compressed URL and load it back', () => {
    cy.visit(evaluatorPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    const code = '42';
    typeMonacoCode(code);

    // The URL is updated after a debounce.
    cy.url().should('include', 'c=');
    cy.url().then((url) => {
      typeMonacoCode('gibberish');
      cy.get('.monaco-editor').first().should('not.contain.text', code);

      cy.visit(url);
      cy.contains('button', 'replace my code').click();
      cy.get('.monaco-editor').first().should('contain.text', code);
    });
  });

  it('should automatically evaluate the code', () => {
    cy.visit(evaluatorPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.run-button').should('not.be.disabled');
    typeMonacoCode('"foo"');
    cy.get('[data-testid="output-area"]').should('contain.text', "'foo'");
    typeMonacoCode('1 + 2');
    cy.get('[data-testid="output-area"]').should('contain.text', '3');
  });
});
