export function dismissDataCollectionModal() {
  cy.contains('OK').click();
}

export function waitForMonacoEditor() {
  cy.get('.monaco-editor').should('be.visible');
}

export function enableSemanticChecks() {
  cy.get('.platform-settings').click();
  cy.get('button').contains('Semantics').click();
  cy.get('.platform-settings').click();
}

export function clearMonacoCode({
  index = 0,
  selector = '.monaco-editor',
}: { index?: number; selector?: string } = {}) {
  cy.get(selector).eq(index).click();
  const mod = Cypress.platform === 'darwin' ? '{cmd}' : '{ctrl}';
  cy.focused().type(`${mod}a{del}`);
  // Wait for the editor to be cleared
  cy.get(selector).eq(index).find('.view-lines').should('have.text', '');
}

export function typeMonacoCode(
  code: string,
  {
    index = 0,
    selector = '.monaco-editor',
    clearBeforeTyping = true,
    parseSpecialCharSequences = true,
  }: {
    index?: number;
    selector?: string;
    clearBeforeTyping?: boolean;
    parseSpecialCharSequences?: boolean;
  } = {},
) {
  if (clearBeforeTyping) {
    clearMonacoCode({ index, selector });
  }
  cy.get(selector).eq(index).type(code, {
    parseSpecialCharSequences,
    // At least 1 millisecond delay per key, so that files updates inside ty's workspace generate different revisions.
    delay: 1,
  });
  // Wait for the editor to contain the code
  cy.get(selector)
    .eq(index)
    .find('.view-lines')
    .should(($lines) => {
      const concatenated = Array.from(
        $lines[0].querySelectorAll<HTMLElement>('.view-line'),
      )
        .map((line) => line.textContent?.replaceAll('\u00A0', ' '))
        .join('\n');
      expect(concatenated).to.equal(code);
    });
}
