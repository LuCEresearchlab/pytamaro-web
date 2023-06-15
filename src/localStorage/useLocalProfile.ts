import produce from 'immer';
import { Dispatch, SetStateAction } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { ActivityVariant, activityVariantId } from '../schemas/activitySchema';
import migrateToV2, { MetadataV1 } from './migrations/v2';
import migrateToV3, { MetadataV2 } from './migrations/v3';
import {
  ActivityVariantMetadata, METADATA_KEY, Metadata, getDefaultMetadata,
} from './schema';

function migrations(metadata: { dataModelVersion: string }) : Metadata {
  if (metadata.dataModelVersion === '1') {
    return migrations(migrateToV2(metadata as MetadataV1));
  }
  if (metadata.dataModelVersion === '2') {
    return migrations(migrateToV3(metadata as MetadataV2));
  }
  return metadata as Metadata;
}

function migrateIfNecessary(
  metadata : { dataModelVersion : string },
  setMetadata: Dispatch<SetStateAction<Metadata>>,
) {
  if (metadata.dataModelVersion !== getDefaultMetadata().dataModelVersion) {
    setMetadata(migrations(metadata));
  }
}

export default function useLocalProfile() {
  const [metadata, setMetadata] = useLocalStorageState(METADATA_KEY, {
    defaultValue: getDefaultMetadata(),
  });
  migrateIfNecessary(metadata, setMetadata);

  const dataSharingAllowed = metadata.allowSharingAnonData === 'yes';
  const requestDataSharingPreference = metadata.allowSharingAnonData === 'unknown';
  const setDataSharingPreference = (preference: 'yes' | 'no') => {
    setMetadata((prevMetadata) => ({
      ...prevMetadata,
      allowSharingAnonData: preference,
    }));
  };

  const findActivity = (activityVariant: ActivityVariant) => metadata.activities.findIndex(
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
      setMetadata((currentMetadata) => produce(currentMetadata, (draft) => {
        draft.activities.splice(idx, 1, activityMetadata);
      }));
    }
  };

  return {
    metadata,
    dataSharingAllowed,
    requestDataSharingPreference,
    setMetadata,
    setDataSharingPreference,
    getActivityMetadata,
    setActivityMetadata,
  };
}
