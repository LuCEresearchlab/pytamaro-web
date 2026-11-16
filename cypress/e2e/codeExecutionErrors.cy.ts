import {
  activityVariantPathnameFromParts,
  playgroundPathname,
} from '../../src/urlUtils';

import {
  dismissDataCollectionModal,
  enableSemanticChecks,
  typeMonacoCode,
  waitForMonacoEditor,
} from '../support/utils';

describe('Code Execution Errors', () => {
  it('should show error with a monaco widget', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('print(a)');
    cy.get('.run-button').first().click();
    cy.get('.monaco-editor-overlaymessage')
      .should('be.visible')
      .contains('Name');
    cy.get('.squiggly-error').should('be.visible');
    cy.get('[data-testid="output-area"]').should('be.empty');
    cy.get('[data-testid="stderr"]').should('be.visible').contains('NameError');
  });

  it('should hide annotations when the code changes', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('print(a)');
    cy.get('.run-button').first().click();
    cy.get('.monaco-editor-overlaymessage').should('be.visible');
    cy.get('.squiggly-error').should('be.visible');
    typeMonacoCode('print()');
    cy.get('.monaco-editor-overlaymessage').should('not.exist');
    cy.get('.squiggly-error').should('not.exist');
  });

  it('should show parse errors even before running the code', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('from');
    cy.get('.squiggly-error').should('be.visible');
  });

  it('should show a name error when semantic analysis is enabled', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    enableSemanticChecks();
    typeMonacoCode('print(a)');
    cy.get('.squiggly-error').should('be.visible');
    cy.get('.monaco-editor-overlaymessage').should('not.exist');
    cy.get('.squiggly-error')
      .first()
      .then((element) => {
        const pos = element[0].getBoundingClientRect();
        cy.get('body').trigger('mousemove', pos.left, pos.top);
        cy.get('.monaco-editor-overlaymessage').should('be.visible');
        cy.get('.monaco-editor-overlaymessage').contains(
          'used when not defined',
        );
        cy.get('.monaco-editor-overlaymessage').contains('Name');
        cy.get('.monaco-editor-overlaymessage code').contains('a');
      });
  });

  it('should show a type error when semantic analysis is enabled', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    enableSemanticChecks();
    typeMonacoCode('1 + "a"');
    cy.get('.squiggly-error').should('be.visible');
    cy.get('.monaco-editor-overlaymessage').should('not.exist');
    cy.get('.squiggly-error')
      .first()
      .then((element) => {
        const pos = element[0].getBoundingClientRect();
        cy.get('body').trigger('mousemove', pos.left, pos.top);
        cy.get('.monaco-editor-overlaymessage').should('be.visible');
        cy.get('.monaco-editor-overlaymessage').contains(
          'not supported between objects of type',
        );
        cy.get('.monaco-editor-overlaymessage').contains('Type');
        // 1st should contain +, 2nd and 3rd the simplified types
        cy.get('.monaco-editor-overlaymessage code').eq(0).contains('+');
        cy.get('.monaco-editor-overlaymessage code').eq(1).contains('int');
        cy.get('.monaco-editor-overlaymessage code').eq(2).contains('str');
      });
  });

  it('should show warning squiggly lines for fine-grained errors', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('def f(a): return a * a\nf("")');
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
    typeMonacoCode('print(a)');
    typeMonacoCode('print(b)', { index: 1 });
    cy.get('.run-button').eq(1).click();
    cy.get('.monaco-editor-overlaymessage').should('be.visible');
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
    typeMonacoCode('import sys\n\nprint("out")\nprint("err", file=sys.stderr)');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]').should('contain.text', 'out');
    cy.get('[data-testid="stderr"]').should('contain.text', 'err');
  });

  it('should analyze errors across cells, show a confirmation dialog, and attach runtime errors to the right cell', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    enableSemanticChecks();
    typeMonacoCode('a = 1\nb = 2\nc = 3');
    typeMonacoCode('print(zzz)', { index: 1 });
    // The static diagnostic is only in the second cell.
    cy.get('.monaco-editor').eq(0).find('.squiggly-error').should('not.exist');
    cy.get('.monaco-editor')
      .eq(1)
      .find('.squiggly-error.analyzer-diagnostic')
      .should('be.visible');
    // Running a cell with errors asks for confirmation.
    cy.get('.run-button').eq(1).click();
    cy.contains('button', 'Run Program Anyway').should('be.visible').click();
    // The runtime error widget is anchored to the second cell.
    cy.get('.monaco-editor')
      .eq(1)
      .find('.monaco-editor-overlaymessage')
      .should('be.visible')
      .and('contain.text', 'Name');
    // The runtime decoration must be on the second cell only.
    cy.get('.monaco-editor')
      .eq(1)
      .find('.traceback-message')
      .should('be.visible');
    cy.get('.monaco-editor')
      .eq(0)
      .find('.monaco-editor-overlaymessage')
      .should('not.exist');
    // Defining the missing name in the first cell re-analyzes the second one,
    // so its squiggle disappears automatically.
    typeMonacoCode('zzz = 1', { index: 0 });
    cy.get('.monaco-editor')
      .eq(1)
      .find('.squiggly-error.analyzer-diagnostic')
      .should('not.exist');
  });

  it('should show the error when a cell calls a function from a previous cell that has an error', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v2'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('def f(): print(a)');
    typeMonacoCode('f()', { index: 1 });
    cy.get('.run-button').eq(1).click();
    cy.get('.monaco-editor-overlaymessage')
      .should('be.visible')
      .contains('Name');
    cy.get('[data-testid="stderr"]').should('be.visible').contains('NameError');
  });
});
