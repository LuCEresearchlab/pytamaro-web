import { MetadataV9 } from '../../src/localStorage/migrations/v10';
import {
  METADATA_KEY,
  getDefaultMetadata,
} from '../../src/localStorage/schema';

export {};

const defaults = getDefaultMetadata();

const metadata: MetadataV9 = {
  dataModelVersion: '9',
  userUuid: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
  experimentKey: '',
  allowSharingAnonData: 'yes',
  activities: [],
  toolbox: [],
  curricula: [],
  platformLocale: 'en',
  docs: defaults.docs,
  lastNotificationSeen: 0,
  liveAnalysis: defaults.liveAnalysis,
  wideEditor: true,
};

const readStoredMetadata = (win: Window) =>
  JSON.parse(win.localStorage.getItem(METADATA_KEY) ?? '');

describe('Local storage migrations', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
      },
    });
  });

  it('migrates a v9 profile to v10 and keeps the existing data', () => {
    cy.window().should((win) => {
      expect(readStoredMetadata(win)).to.deep.include({
        ...metadata,
        dataModelVersion: '10',
        ideLibraries: [],
      });
    });
  });

  it('leaves the profile unchanged on the next load', () => {
    cy.window().should((win) => {
      expect(readStoredMetadata(win).dataModelVersion).to.equal('10');
    });
    cy.window().then((win) => {
      const migrated = readStoredMetadata(win);
      cy.reload();
      cy.window().should((reloadedWin) => {
        expect(readStoredMetadata(reloadedWin)).to.deep.equal(migrated);
      });
    });
  });
});
