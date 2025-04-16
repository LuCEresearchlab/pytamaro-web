export function dismissDataCollectionModal() {
  cy.contains('OK').click();
}

export function waitForMonacoEditor() {
  cy.contains('from pytamaro import').should('be.visible');
}
