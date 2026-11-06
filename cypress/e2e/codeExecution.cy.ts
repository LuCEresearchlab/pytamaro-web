import {
  activityVariantPathnameFromParts,
  playgroundPathname,
} from '../../src/urlUtils';
import {
  clearMonacoCode,
  dismissDataCollectionModal,
  typeMonacoCode,
  waitForMonacoEditor,
} from '../support/utils';

export {};

describe('Code Execution', () => {
  it('should execute initial playground code', () => {
    cy.visit(playgroundPathname());
    dismissDataCollectionModal();
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]')
      .find('img')
      .should('have.attr', 'src');
  });

  it('should keep state over multiple cells', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('from pytamaro import *\nr = rectangle(10, 5, red)');
    typeMonacoCode('show_graphic(r)', { index: 1 });
    cy.get('.run-button').eq(1).click();
    cy.get('[data-testid="output-area"]')
      .first()
      .find('img')
      .should('have.attr', 'src');
  });

  it('should share globals across code cells', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('def f(): return foo');
    typeMonacoCode('foo = 42\nprint(f())', { index: 1 });
    cy.get('.run-button').eq(1).click();
    cy.get('[data-testid="output-area"]').first().contains('42');
  });

  it('should save and import a toolbox function', () => {
    // Save function 'f' to the toolbox
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('def f(): print(1)');
    cy.get('.save-to-toolbox-dialog-button').first().click();
    cy.get('#select-function').click();
    cy.get('li[data-value="f"]').click();
    cy.get('.function-description').type('f');
    clearMonacoCode({ selector: '#usage .monaco-editor' });
    cy.get('.MuiDialog-container .run-button').first().click();
    cy.get('.save-to-toolbox-button').click();

    // Use the toolbox function in another activity
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v2'),
    );
    waitForMonacoEditor();
    typeMonacoCode('from toolbox import f; f()');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]').first().contains('1');
  });

  it('should support interactive input over multiple cells', () => {
    cy.visit(
      activityVariantPathnameFromParts('luce', 'swiss-flag', 'en', 'v1'),
    );
    dismissDataCollectionModal();
    waitForMonacoEditor();
    // First cell
    typeMonacoCode('input("Cell 0")');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]').contains('Cell 0');
    cy.get('[data-testid="output-area"]')
      .find('[data-testid="input-area"]')
      .should('be.visible');
    // Stop the execution, a new re-execution should produce a usable input field again
    cy.get('.run-button').first().click(); // stop
    cy.get('.run-button').first().click(); // re-run
    cy.get('[data-testid="output-area"]').contains('Cell 0');
    cy.get('[data-testid="output-area"]')
      .find('[data-testid="input-area"]')
      .should('be.visible');
    cy.get('[data-testid="input-area"]').type('first{enter}');
    cy.get('[data-testid="output-area"]').first().contains('first');
    // Second cell
    typeMonacoCode('input("Cell 1")', { index: 1 });
    cy.get('.run-button').eq(1).click();
    // program re-runs from the beginning, two input requests progressively activated
    cy.get('[data-testid="output-area"]').eq(0).contains('Cell 0');
    cy.get('[data-testid="output-area"]')
      .eq(0)
      .find('[data-testid="input-area"]')
      .should('be.visible');
    cy.get('[data-testid="input-area"]').type('first{enter}');
    cy.get('[data-testid="output-area"]').eq(1).contains('Cell 1');
    cy.get('[data-testid="output-area"]')
      .eq(1)
      .find('[data-testid="input-area"]')
      .should('be.visible');
    cy.get('[data-testid="input-area"]').eq(1).type('second{enter}');
    cy.get('[data-testid="output-area"]').eq(1).contains('second');
  });
});
