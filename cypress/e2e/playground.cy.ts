import {
  dismissDataCollectionModal,
  setLiveAnalysis,
  typeMonacoCode,
  waitForMonacoEditor,
} from '../support/utils';

export {};

describe('Playground Page', () => {
  beforeEach(() => {
    cy.visit('/playground');
  });

  it('should contain some initial code', () => {
    waitForMonacoEditor();
    cy.get('.view-line').should('have.length.at.least', 2);
  });

  it('should allow sharing a link to the current code', () => {
    dismissDataCollectionModal();
    waitForMonacoEditor();

    const code = 'print("Shared!")';
    typeMonacoCode(code);

    // Capture what the share button writes to the clipboard instead of reading
    // the real clipboard: Chrome refuses clipboard reads when the document is
    // not focused, which is the case in Cypress.
    // https://github.com/cypress-io/cypress/issues/18198
    let sharedUrl = '';
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'write').callsFake(
        async (items: ClipboardItem[]) => {
          const blob = await items[0].getType('text/plain');
          sharedUrl = await blob.text();
        },
      );
      cy.stub(win.navigator.clipboard, 'writeText').callsFake(
        async (text: string) => {
          sharedUrl = text;
        },
      );
    });

    cy.get('[data-testid="share-button"]').click();
    cy.wrap(null).should(() => {
      expect(sharedUrl).to.contain('c=');
    });

    typeMonacoCode('gibberish');
    cy.get('.monaco-editor').first().should('not.contain.text', code);

    // Expect the content to be back after visiting the shared URL
    cy.then(() => cy.visit(sharedUrl));
    cy.contains('button', 'replace my code').click();
    cy.get('.monaco-editor').first().should('contain.text', code);
  });

  it('should load uncompressed base64 code from URL', () => {
    dismissDataCollectionModal();
    const code = 'print("Magic!")';
    const base64Code = Buffer.from(code).toString('base64');
    cy.visit(`/playground?code=${base64Code}`);
    cy.get('.monaco-editor').first().should('contain.text', code);
  });

  it('should drop Python highlighting when live analysis is set to None', () => {
    dismissDataCollectionModal();
    waitForMonacoEditor();
    const code = 'print("hello")';
    typeMonacoCode(code);

    // With syntax highlighting, the string literal has its own token class.
    cy.get('.view-line .mtk26').should('exist');

    // Switching the setting must take effect immediately, without a reload.
    setLiveAnalysis('None');
    cy.get('.view-line .mtk26').should('not.exist');
    cy.get('.view-line').first().should('contain.text', code);
  });
});
