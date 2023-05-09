import useLocalStorageState from 'use-local-storage-state';
import { Dispatch, SetStateAction } from 'react';
import { METADATA_KEY, Metadata, getDefaultMetadata } from './schema';
import migrateToV2, { MetadataV1 } from './migrations/v2';

function migrateIfNecessary(
  metadata : { dataModelVersion : string },
  setMetadata: Dispatch<SetStateAction<Metadata>>,
) {
  if (metadata.dataModelVersion === '1') {
    setMetadata(migrateToV2(metadata as MetadataV1));
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
  return {
    metadata,
    dataSharingAllowed,
    requestDataSharingPreference,
    setMetadata,
    setDataSharingPreference,
  };
}
