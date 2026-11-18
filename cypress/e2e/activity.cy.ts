import { activityVariantPathnameFromParts } from '../../src/urlUtils';
import {
  dismissDataCollectionModal,
  typeMonacoCode,
  waitForMonacoEditor,
} from '../support/utils';

export {};

describe('Activity Page', () => {
  it('should hide teacher-only cells', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'color-flower', 'en', 'v2'),
    );

    // only 2 visible cells
    cy.get('.monaco-editor', { timeout: 20000 }).should('have.length', 2);

    // visible cells contain keyword "pass"
    cy.get('.lines-content', { timeout: 20000 }).each(($cell) => {
      cy.wrap($cell).within(() => {
        cy.get('.mtk1').contains('pass').should('have.length.at.least', 1);
      });
    });
  });

  it('should reset a single cell, then the whole activity, and keep persisting edits', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    const initialFirstCellCodeFragment = 'Create a red square';
    const codeFirstCell = 'print("A")';
    const codeSecondCell = 'print("B")';
    typeMonacoCode(codeFirstCell);
    typeMonacoCode(codeSecondCell, { index: 1 });
    cy.get('.run-button').eq(1).click();
    cy.get('[data-testid="output-area"]').eq(0).should('contain.text', 'A');
    cy.get('[data-testid="output-area"]').eq(1).should('contain.text', 'B');

    // Reset only the first cell.
    cy.get('.pytamaro-web-code-cell')
      .eq(0)
      .find('button[aria-label="more"]')
      .click();
    cy.contains('[role="menuitem"]', 'Reset Cell').click();
    cy.get('[role="dialog"]').contains('button', 'Ok, delete my code').click();
    cy.get('.monaco-editor').eq(0).should('not.contain.text', codeFirstCell);
    cy.get('.monaco-editor').eq(0).contains(initialFirstCellCodeFragment);
    // The second cell keeps its code, but its output is now stale because the
    // first cell (which it depends on) has changed.
    cy.get('.monaco-editor').eq(1).contains(codeSecondCell);
    cy.get('[data-testid="output-area"]')
      .should('have.length', 1)
      .and('contain.text', 'B');
    cy.get(
      '.MuiBadge-badge:not(.MuiBadge-invisible) [data-testid="stale-output-icon"]',
    ).should('have.length', 1);

    // Reset the whole activity.
    cy.get('[data-testid="reset-activity"]').click();
    cy.get('[role="dialog"]').contains('button', 'OK, delete my code').click();
    cy.get('.monaco-editor').eq(0).should('not.contain.text', codeFirstCell);
    cy.get('.monaco-editor').eq(1).should('not.contain.text', codeSecondCell);
    cy.get('[data-testid="output-area"]').should('not.exist');

    // Editing still persists after the session has been rewritten by the reset.
    typeMonacoCode('persisted_after_reset = 1');
    cy.reload();
    waitForMonacoEditor();
    cy.get('.monaco-editor').eq(0).contains('persisted_after_reset = 1');
  });
});
