import { activityVariantPathnameFromParts, playgroundPathname } from '../../src/urlUtils';

export { };

function dismissDataCollectionModal() {
  cy.contains('OK').click();
}

function waitForMonacoEditor() {
  cy.contains('from pytamaro import').should('be.visible');
}

describe('Code Execution', () => {
  it('should execute initial playground code', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    cy.get('.run-button').first().click();
    cy.get('.output-area').find('img').should('have.attr', 'src');
  });

  it('should keep state over multiple cells', () => {
    cy.visit(activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'));
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type('from pytamaro import *{enter}r = rectangle(10, 5, red)');
    cy.get('.monaco-editor').eq(1).type('{selectall}{backspace}');
    cy.get('.monaco-editor').eq(1).type('show_graphic(r)');
    cy.get('.run-button').eq(1).click();
    cy.get('.output-area').first().find('img').should('have.attr', 'src');
  });

  it('should save and import a toolbox function', () => {
    // Save function 'f' to the toolbox
    cy.visit(activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'));
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type('def f(): print(1)');
    cy.get('.save-to-toolbox-dialog-button').first().click();
    cy.get('#select-function').click();
    cy.get('li[data-value="f"]').click();
    cy.get('.function-description').type('f');
    cy.get('.MuiDialog-container .run-button').first().click();
    cy.get('.save-to-toolbox-button').click();

    // Use the toolbox function in another activity
    cy.visit(activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v2'));
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type('from toolbox import f; f()');
    cy.get('.run-button').first().click();
    cy.get('.output-area').first().contains('1');
  });
});
