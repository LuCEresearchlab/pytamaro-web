import {
  activityVariantPathnameFromParts,
  playgroundPathname,
} from '../../src/urlUtils';
import {
  dismissDataCollectionModal,
  waitForMonacoEditor,
} from '../support/utils';

describe('Code Execution Errors', () => {
  it('should show error with a monaco widget', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type('print(a)');
    cy.get('.run-button').first().click();
    cy.get('.monaco-editor-overlaymessage')
      .should('be.visible')
      .contains('NameError');
    cy.get('.squiggly-error').should('be.visible');
    cy.get('.output-area').should('be.empty');
    cy.get('.output-area').parent().contains('NameError');
  });

  it('should hide annotations when the code changes', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type('print(a)');
    cy.get('.run-button').first().click();
    cy.get('.monaco-editor-overlaymessage')
      .should('be.visible')
      .contains('NameError');
    cy.get('.squiggly-error').should('be.visible');
    cy.get('.monaco-editor textarea:first').focus();
    cy.get('.monaco-editor').first().type('{leftarrow}{backspace}');
    cy.get('.monaco-editor-overlaymessage').should('not.exist');
    cy.get('.squiggly-error').should('not.exist');
  });

  it('should show parse errors even before running the code', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type('from');
    cy.get('.squiggly-error').should('be.visible');
  });

  it('should show warning squiggly lines for fine-grained errors', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type('def f(a): return a * a\nf("")');
    cy.get('.run-button').first().click();
    cy.get('.squiggly-warning').should('be.visible');
    cy.get('.squiggly-warning').should('be.visible').should('have.length', 2);
  });

  it('should notify about errors in previous cells and scroll', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v2'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type('print(a)');
    cy.get('.monaco-editor').eq(1).type('{selectall}{backspace}');
    cy.get('.monaco-editor').eq(1).type('print(b)');
    cy.get('.run-button').eq(1).click();
    cy.get('.monaco-editor-overlaymessage')
      .should('be.visible')
      .contains('NameError');
    cy.get('.monaco-editor')
      .first()
      .should((editor) => {
        const rect = editor[0].getBoundingClientRect();
        expect(rect.top).to.be.lessThan(0);
      });
    cy.get('.MuiAlert-action button').should('be.visible').click();
    cy.get('.monaco-editor')
      .first()
      .should((editor) => {
        const rect = editor[0].getBoundingClientRect();
        expect(rect.top).to.be.greaterThan(0);
      });
  });

  it('should show the stderr output', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor')
      .first()
      .type('import sys\nprint("out")\nprint("err", file=sys.stderr)');
    cy.get('.run-button').first().click();
    cy.get('.output-area').should('contain.text', 'out');
    cy.get('.output-area').parent().should('contain.text', 'err');
  });

  it('should show the error when a cell calls a function from a previous cell that has an error', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v2'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().type('{selectall}{backspace}');
    cy.get('.monaco-editor').first().type('def f(): print(a)');
    cy.get('.monaco-editor').eq(1).type('{selectall}{backspace}');
    cy.get('.monaco-editor').eq(1).type('f()');
    cy.get('.run-button').eq(1).click();
    cy.get('.monaco-editor-overlaymessage')
      .should('be.visible')
      .contains('NameError');
    cy.get('.output-area').parent().contains('NameError');
  });
});
