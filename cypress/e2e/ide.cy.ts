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

  it('should show the bytes view of text files', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('AÈ');
    cy.get('[data-testid="file-view-bytes"]').click();
    cy.get('[data-testid="bytes-file-view"]').should('contain.text', '41c388');
  });

  it('should preview CSV files as a table', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('[data-testid="new-file-button"]').click();
    cy.get('[data-testid="file-tree-dropzone"]')
      .find('input[type="text"]')
      .type('data.csv{enter}');
    // A CSV opens in preview mode, even before it has any content.
    cy.get('[data-testid="csv-preview"]').should('be.visible');
    // Edit the file as text, then switch back to the table preview.
    cy.get('[data-testid="file-view-text"]').click();
    waitForMonacoEditor();
    typeMonacoCode('name;value\nalpha;1\nbeta;2');
    cy.get('[data-testid="file-view-preview"]').click();
    // The default separator is a comma, so the whole row is one column.
    cy.get('[data-testid="csv-preview"]').within(() => {
      cy.get('thead th').should('have.length', 1);
      cy.get('thead th').should('have.text', 'name;value');
    });
    // Choosing the semicolon splits the row into the expected columns.
    cy.get('[data-testid="csv-separator-select"]').click();
    cy.get('li[data-value=";"]').click();
    cy.get('[data-testid="csv-preview"]').within(() => {
      cy.get('thead th').eq(0).should('have.text', 'name');
      cy.get('thead th').eq(1).should('have.text', 'value');
      cy.get('tbody tr').eq(0).find('td').eq(1).should('have.text', '1');
      cy.get('tbody tr').eq(1).find('td').eq(1).should('have.text', '2');
    });
    // Without a header row, the first row becomes a regular body row.
    cy.get('[data-testid="csv-header-toggle"]').click();
    cy.get('[data-testid="csv-preview"]').within(() => {
      cy.get('thead').should('not.exist');
      cy.get('tbody tr').eq(0).find('td').eq(0).should('have.text', 'name');
      cy.get('tbody tr').eq(0).find('td').eq(1).should('have.text', 'value');
    });
  });

  it('should support interactive input', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('input(); input()');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]')
      .find('[data-testid="input-area"]')
      .should('be.visible')
      .type('hello{enter}');
    cy.get('[data-testid="output-area"]').should('contain.text', 'hello');
    cy.get('[data-testid="output-area"]')
      .find('[data-testid="input-area"]')
      .eq(1)
      .should('be.visible')
      .type('world{enter}');
    cy.get('[data-testid="output-area"]').should('contain.text', 'world');
  });

  it('should support running individually multiple files', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    cy.get('[data-testid="new-file-button"]').click();
    cy.get('[data-testid="file-tree-dropzone"]')
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

  it('should install and use additional Python libraries', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    // Wait for the Python environment to be ready before installing a library.
    cy.get('.run-button').should('not.be.disabled');
    // Install numpy and verify that it works.
    cy.get('[data-testid="libraries-button"]').click();
    cy.contains('[role="dialog"] label', 'NumPy').find('input').check();
    cy.contains('[role="dialog"] label', 'NumPy')
      .find('input')
      .should('be.checked')
      .and('not.be.disabled');
    cy.contains('[role="dialog"] button', 'Close').click();
    cy.get('[role="dialog"]').should('not.exist');
    typeMonacoCode('import numpy as np\nprint(np.array([1, 2, 3, 4, 5]))');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]')
      .should('be.visible')
      .contains('[1 2 3 4 5]');
    // Uninstall numpy and verify that it is no longer available.
    cy.get('[data-testid="libraries-button"]').click();
    cy.contains('[role="dialog"] label', 'NumPy').find('input').uncheck();
    cy.contains('[role="dialog"] label', 'NumPy')
      .find('input')
      .should('not.be.checked')
      .and('not.be.disabled');
    cy.contains('[role="dialog"] button', 'Close').click();
    cy.get('[role="dialog"]').should('not.exist');
    typeMonacoCode('import numpy as np\nprint(np.array([1, 2, 3]))');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="stderr"]')
      .should('be.visible')
      .contains('ModuleNotFoundError');
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
    cy.get('[data-testid="file-view-bytes"]').click();
    cy.get('[data-testid="bytes-file-view"]').should(
      'contain.text',
      '89504e47',
    );
    cy.get('[data-testid="file-view-preview"]').click();
    cy.get('img[alt="out.png"]').should('be.visible');
  });

  it('should show touched files already at input', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('with open("f.txt", "w") as f: f.write("content")\ninput()');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="file-tree"]').should('contain.text', 'f.txt');
    cy.get('[data-testid="file-tree"]').contains('f.txt').click();
    cy.get('.monaco-editor').contains('content');
    // The output area is unmounted while a non-Python file is open. Going
    // back to the Python file must restore the input field that is still
    // waiting for input.
    cy.get('[data-testid="editor-tabs"]').contains('main.py').click();
    cy.get('[data-testid="output-area"]')
      .find('[data-testid="input-area"]')
      .should('be.visible')
      .type('hello{enter}');
    cy.get('[data-testid="output-area"]').should('contain.text', 'hello');
  });
});
