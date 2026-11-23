import produce from 'immer';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { isOptionalIdeLibrary } from '../ide/libraries';
import { ActivityVariant, activityVariantId } from '../schemas/activitySchema';
import { Curriculum, curriculumToId } from '../schemas/curriculumSchema';
import migrateToV10 from './migrations/v10';
import migrateToV2 from './migrations/v2';
import migrateToV3 from './migrations/v3';
import migrateToV4 from './migrations/v4';
import migrateToV5 from './migrations/v5';
import migrateToV6 from './migrations/v6';
import migrateToV7 from './migrations/v7';
import migrateToV8 from './migrations/v8';
import migrateToV9 from './migrations/v9';
import {
  ActivityVariantMetadata,
  DocsMetadata,
  METADATA_KEY,
  Metadata,
  getDefaultMetadata,
} from './schema';

/**
 * Runs every migration needed to bring the given metadata up to the current version.
 * If no migration, the same object is returned, so callers can compare references to determine if a migration happened.
 */
function migrateMetadata(metadata: { dataModelVersion: string }): Metadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const migrationForVersion: { [key: string]: (metadata: any) => any } = {
    1: migrateToV2,
    2: migrateToV3,
    3: migrateToV4,
    4: migrateToV5,
    5: migrateToV6,
    6: migrateToV7,
    7: migrateToV8,
    8: migrateToV9,
    9: migrateToV10,
  };
  const migrationFn = migrationForVersion[metadata.dataModelVersion];
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (migrationFn) {
    return migrateMetadata(migrationFn(metadata));
  }
  return metadata as Metadata;
}

export default function useLocalProfile() {
  const [storedMetadata, setStoredMetadata] = useLocalStorageState(
    METADATA_KEY,
    {
      defaultValue: getDefaultMetadata(),
    },
  );

  // Everything below reads from the migrated metadata, even on the very first render after a migration.
  const metadata = useMemo(
    () => migrateMetadata(storedMetadata),
    [storedMetadata],
  );

  // Persist the migrated metadata as a side effect rather than during render.
  // Once stored, `migrateMetadata` returns the same reference, so this stops.
  useEffect(() => {
    if (metadata !== storedMetadata) {
      setStoredMetadata((previous) => migrateMetadata(previous));
    }
  }, [metadata, storedMetadata, setStoredMetadata]);

  // Functional updates also start from migrated metadata, in case a setter
  // runs before the persistence effect above has flushed.
  const setMetadata = useCallback<Dispatch<SetStateAction<Metadata>>>(
    (action) => {
      setStoredMetadata((previous) => {
        const current = migrateMetadata(previous);
        return typeof action === 'function' ? action(current) : action;
      });
    },
    [setStoredMetadata],
  );

  const dataSharingAllowed = metadata.allowSharingAnonData === 'yes';
  const requestDataSharingPreference =
    metadata.allowSharingAnonData === 'unknown';
  const setDataSharingPreference = (preference: 'yes' | 'no') => {
    setMetadata((prevMetadata) => ({
      ...prevMetadata,
      allowSharingAnonData: preference,
    }));
  };

  const findActivity = (activityVariant: ActivityVariant) =>
    metadata.activities.findIndex(
      (activity) => activity.id === activityVariantId(activityVariant),
    );

  const getActivityMetadata = (activityVariant: ActivityVariant) => {
    const idx = findActivity(activityVariant);
    return idx === -1 ? undefined : metadata.activities[idx];
  };

  const setActivityMetadata = (
    activityVariant: ActivityVariant,
    activityMetadata: ActivityVariantMetadata,
  ) => {
    const idx = findActivity(activityVariant);
    if (idx !== -1) {
      setMetadata((currentMetadata) =>
        produce(currentMetadata, (draft) => {
          draft.activities.splice(idx, 1, activityMetadata);
        }),
      );
    }
  };

  const findCurriculum = (curriculum: Curriculum) =>
    metadata.curricula.findIndex((c) => c.id === curriculumToId(curriculum));

  const removeCurriculum = (curriculum: Curriculum) => {
    const idx = findCurriculum(curriculum);
    if (idx !== -1) {
      setMetadata((currentMetadata) =>
        produce(currentMetadata, (draft) => {
          draft.curricula.splice(idx, 1);
        }),
      );
    }
  };

  const setPlatformLocale = (locale: string) => {
    setMetadata((currentMetadata) =>
      produce(currentMetadata, (draft) => {
        draft.platformLocale = locale;
      }),
    );
  };

  const docsMetadata = metadata.docs;

  const setDocsMetadata = (newDocsMetadata: DocsMetadata) => {
    setMetadata((currentMetadata) =>
      produce(currentMetadata, (draft) => {
        draft.docs = newDocsMetadata;
      }),
    );
  };

  const selectedIdeLibrariesIds = useMemo(
    () => metadata.ideLibraries.filter(isOptionalIdeLibrary),
    [metadata.ideLibraries],
  );

  return {
    metadata,
    dataSharingAllowed,
    requestDataSharingPreference,
    setMetadata,
    setDataSharingPreference,
    getActivityMetadata,
    setActivityMetadata,
    findCurriculum,
    removeCurriculum,
    setPlatformLocale,
    docsMetadata,
    setDocsMetadata,
    selectedIdeLibrariesIds,
  };
}
