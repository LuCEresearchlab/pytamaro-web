import { activityVariantPathnameFromParts } from '../../src/urlUtils';
import {
  dismissDataCollectionModal,
  typeMonacoCode,
  waitForMonacoEditor,
} from '../support/utils';

export {};

describe('Code Local Storage', () => {
  it('should persist state after refresh', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    const source = 'dummy_source = 42';
    typeMonacoCode(source);
    cy.reload();
    waitForMonacoEditor();
    cy.get('.monaco-editor').first().contains(source);
  });

  it('keeps outputs across reload and invalidates only from the edited cell', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('x = 1\nprint("A")');
    typeMonacoCode('print("B", x)', { index: 1 });
    cy.get('.run-button').eq(1).click();
    cy.get('[data-testid="output-area"]').eq(1).should('contain.text', 'B 1');
    cy.reload();
    waitForMonacoEditor();
    cy.get('.monaco-editor').eq(1).contains('print("B", x)');
    cy.get('[data-testid="output-area"]').first().should('contain.text', 'A');
    typeMonacoCode('print("C")', { index: 1 });
    // Editing the second cell must not invalidate the output of the first one.
    // Only one "out of sync" badge should be visible (the one of the second cell).
    cy.get('[data-testid="output-area"]').first().should('contain.text', 'A');
    cy.get(
      '.MuiBadge-badge:not(.MuiBadge-invisible) [data-testid="SyncProblemIcon"]',
    ).should('have.length', 1);
  });
});
