import { DATABASE_NAME } from '../../src/ide/filesPersistence';
import { idePathname } from '../../src/urlUtils';
import {
  dismissDataCollectionModal,
  typeMonacoCode,
  waitForMonacoEditor,
} from '../support/utils';

export {};

describe('IDE', () => {
  // The IDE saves its files in IndexedDB, which Cypress does not reset between
  // tests: clear it so that every test starts from the initial workspace.
  beforeEach(() => {
    indexedDB.deleteDatabase(DATABASE_NAME);
  });

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

  it('should keep partially typed input when the output area is hidden and shown again', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('input()');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]')
      .find('[data-testid="input-area"]')
      .should('be.visible')
      .type('hello');
    // Hide the output area without submitting the input.
    cy.get('[data-testid="toggle-output-area"]').click();
    cy.get('[data-testid="input-area"]').should('not.be.visible');
    // Show it again: the partially typed input is still there.
    cy.get('[data-testid="toggle-output-area"]').click();
    cy.get('[data-testid="output-area"]')
      .find('[data-testid="input-area"]')
      .should('be.visible')
      .and('have.text', 'hello')
      .type('{enter}');
    cy.get('[data-testid="output-area"]').should('contain.text', 'hello');
  });

  it('should let the user resize the output area by dragging the separator', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode('print("hello")');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]')
      .should('be.visible')
      .and('contain.text', 'hello');

    const separator = '[data-testid="output-separator"]';
    const dragDistance = 100;
    const center = ($separator: JQuery<HTMLElement>) => {
      const rect = $separator[0].getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    cy.get(separator).then(($separator) => {
      const { x, y } = center($separator);
      const pointer = { pointerId: 1, pointerType: 'mouse', isPrimary: true };
      cy.wrap($separator).trigger('pointerdown', {
        ...pointer,
        button: 0,
        buttons: 1,
        clientX: x,
        clientY: y,
      });
      cy.document().trigger('pointermove', {
        ...pointer,
        buttons: 1,
        clientX: x,
        clientY: y - dragDistance,
      });
      cy.document().trigger('pointerup', {
        ...pointer,
        button: 0,
        buttons: 0,
        clientX: x,
        clientY: y - dragDistance,
      });
      // Dragging up makes the output area taller, so the separator moves up.
      cy.get(separator).should(($moved) => {
        expect(center($moved).y).to.be.lessThan(y - dragDistance / 2);
      });
    });
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
    typeMonacoCode('"item ""name"", or ""surname""";value\nalpha;1\nbeta;2');
    cy.get('[data-testid="file-view-preview"]').click();
    // Should detect ; as separator automatically,
    // ignoring the comma within the quoted field
    cy.get('[data-testid="csv-preview"]').within(() => {
      cy.get('thead th').eq(0).should('have.text', 'item "name", or "surname"');
      cy.get('thead th').eq(1).should('have.text', 'value');
      cy.get('tbody tr').eq(0).find('td').eq(1).should('have.text', '1');
      cy.get('tbody tr').eq(1).find('td').eq(1).should('have.text', '2');
    });
    // Choosing the comma splits the row into a single column.
    cy.get('[data-testid="csv-separator-select"]').click();
    cy.get('li[data-value=","]').click();
    cy.get('[data-testid="csv-preview"]').within(() => {
      cy.get('thead th').should('have.length', 1);
      cy.get('thead th').should('have.text', 'item "name", or "surname";value');
    });
    // Without a header row, the first row becomes a regular body row.
    cy.get('[data-testid="csv-separator-select"]').click();
    cy.get('li[data-value=";"]').click();
    cy.get('[data-testid="csv-header-toggle"]').click();
    cy.get('[data-testid="csv-preview"]').within(() => {
      cy.get('thead').should('not.exist');
      cy.get('tbody tr')
        .eq(0)
        .find('td')
        .eq(0)
        .should('have.text', 'item "name", or "surname"');
      cy.get('tbody tr').eq(0).find('td').eq(1).should('have.text', 'value');
    });
  });

  it('should support multiple interactive inputs', () => {
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

  it('should show graphics while the program waits for input', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    typeMonacoCode(
      'from pytamaro import show_graphic, rectangle, red\nshow_graphic(rectangle(200, 100, red))\ninput()',
    );
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]').find('img').should('be.visible');
    cy.get('[data-testid="output-area"]')
      .find('[data-testid="input-area"]')
      .should('be.visible');
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
    // The output area is not visible while a non-Python file is open. Going
    // back to the Python file must restore the input field that is still
    // waiting for input.
    cy.get('[data-testid="editor-tabs"]').contains('main.py').click();
    cy.get('[data-testid="output-area"]')
      .find('[data-testid="input-area"]')
      .should('be.visible')
      .type('hello{enter}');
    cy.get('[data-testid="output-area"]').should('contain.text', 'hello');
  });

  it('should not keep an imported module importable after its file is deleted', () => {
    cy.visit(idePathname());
    dismissDataCollectionModal();
    waitForMonacoEditor();
    // Create a module and import it from main.py, so that CPython caches it.
    cy.get('[data-testid="new-file-button"]').click();
    cy.get('[data-testid="file-tree-dropzone"]')
      .find('input[type="text"]')
      .type('utils.py{enter}');
    cy.get('[data-testid="file-tree"]').contains('utils.py').click();
    typeMonacoCode('def greet(): return "hello from utils"');
    cy.get('[data-testid="editor-tabs"]').contains('main.py').click();
    typeMonacoCode('from utils import greet\nprint(greet())');
    cy.get('.run-button').first().click();
    cy.get('[data-testid="output-area"]')
      .should('be.visible')
      .contains('hello from utils');

    // Delete the module and run main.py again.
    const utilsItem = () =>
      cy
        .get('[data-testid="file-tree"]')
        .contains('utils.py')
        .closest('[role="treeitem"]');
    utilsItem().find('[aria-label="More actions"]').click({ force: true });
    utilsItem().find('[aria-label="Delete file"]').click();
    cy.get('[role="dialog"]').contains('button', 'Delete file').click();
    cy.get('[data-testid="file-tree"]').should('not.contain.text', 'utils.py');

    cy.get('.run-button').first().click();
    // The module must not be served from CPython's cache.
    cy.get('[data-testid="stderr"]')
      .should('be.visible')
      .contains('ModuleNotFoundError');
  });
});
