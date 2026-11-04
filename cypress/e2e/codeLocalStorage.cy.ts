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
});
