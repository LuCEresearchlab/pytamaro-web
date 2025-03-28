import { activityVariantPathnameFromParts } from '../../src/urlUtils';

export {};

function dismissDataCollectionModal() {
  cy.contains('OK').click();
}

function waitForMonacoEditor() {
  cy.contains('from pytamaro import').should('be.visible');
}

describe('Code Local Storage', () => {
  it('should persist state after refresh', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    const source = 'dummy_source = 42';
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type(source);
    cy.reload();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().contains(source);
  });
});
