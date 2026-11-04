import { idePathname } from '../../src/urlUtils';
import {
  dismissDataCollectionModal,
  typeMonacoCode,
  waitForMonacoEditor,
} from '../support/utils';

export {};

describe('IDE', () => {
  it('should run a single file', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('1/0');
    cy.get('[data-testid="file-tree"]').should('contain.text', 'main.py');
    cy.get('[data-testid="editor-tabs"]').should('contain.text', 'main.py');
    cy.get('.run-button').first().click();
    cy.get('.monaco-editor-overlaymessage')
      .should('be.visible')
      .contains('ZeroDivisionError');
    cy.get('[data-testid="stderr"]').should('be.visible').contains('main.py');
  });

  it('should support running individually multiple files', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('[data-testid="new-file-button"]').click();
    cy.get('[data-testid="file-tree"]')
      .find('input[type="text"]')
      .type('utils.py{enter}');
    cy.get('[data-testid="file-tree"]').should('contain.text', 'utils.py');
    // Open the second file
    cy.get('[data-testid="file-tree"]').contains('utils.py').click();
    cy.get('[data-testid="editor-tabs"]').should('contain.text', 'utils.py');
    typeMonacoCode('def greet(name): return f"Hello, {name}!"', {
      parseSpecialCharSequences: false,
    });
    // Run the second file
    cy.get('.run-button').first().click();
    cy.get('.stdout').should('not.exist');
    // Open the first file again
    cy.get('[data-testid="editor-tabs"]').contains('main.py').click();
    typeMonacoCode('from utils import greet\nprint(greet("World"))');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]')
      .should('be.visible')
      .contains('Hello, World!');
  });

  it('should save generated files', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode(
      'from pytamaro import save_graphic, rectangle, red\nsave_graphic("out.png", rectangle(200, 100, red))',
    );
    cy.get('.run-button').first().click();
    cy.get('[data-testid="file-tree"]').should('contain.text', 'out.png');
    cy.get('[data-testid="file-tree"]').contains('out.png').click();
    cy.get('img[alt="out.png"]').should('be.visible');
    cy.get('[data-testid="binary-file-hex-toggle"]').click();
    cy.get('[data-testid="hex-file-view"]').should('contain.text', '89504e47');
    cy.get('[data-testid="binary-file-preview-toggle"]').click();
    cy.get('img[alt="out.png"]').should('be.visible');
  });
});
