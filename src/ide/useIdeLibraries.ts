import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ExecutorContext } from '../execution/executorContext';
import useLocalProfile from '../localStorage/useLocalProfile';
import { OPTIONAL_IDE_LIBRARIES, type Library } from './libraries';

export type LibraryOption = {
  library: Library;
  /** Includes the pending change, so the checkbox responds immediately. */
  checked: boolean;
  pending: boolean;
};

/**
 * Keeps the libraries selected in the IDE in sync with the Python environment
 * and exposes everything the libraries dialog needs to render and toggle them.
 */
export default function useIdeLibraries() {
  const { setMetadata, selectedIdeLibrariesIds: selectedIds } =
    useLocalProfile();
  const { executorState, configureLibraries } = useContext(ExecutorContext);
  const executorReady = executorState.type === 'available';

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [installationFailed, setInstallationFailed] = useState(false);

  useEffect(() => {
    if (!executorReady || pendingId !== null) {
      return;
    }
    configureLibraries(selectedIds).catch(() => setInstallationFailed(true));
  }, [executorReady, pendingId, selectedIds, configureLibraries]);

  const toggleLibrary = useCallback(
    async (id: string) => {
      const wanted = new Set(selectedIds);
      if (!wanted.delete(id)) {
        wanted.add(id);
      }
      const next = OPTIONAL_IDE_LIBRARIES.map((library) => library.id).filter(
        (libraryId) => wanted.has(libraryId),
      );
      setPendingId(id);
      setInstallationFailed(false);
      try {
        // Persist only after the environment has accepted the change, so a
        // failed installation leaves both the selection and the analyzer as
        // they were.
        await configureLibraries(next);
        setMetadata((prevMetadata) => ({
          ...prevMetadata,
          ideLibraries: next,
        }));
      } catch {
        setInstallationFailed(true);
      } finally {
        setPendingId(null);
      }
    },
    [configureLibraries, selectedIds, setMetadata],
  );

  const options = useMemo<LibraryOption[]>(
    () =>
      OPTIONAL_IDE_LIBRARIES.map((library) => {
        const pending = pendingId === library.id;
        return {
          library,
          pending,
          // A pending change flips the persisted state. If it fails,
          // `pendingId` is cleared and the checkbox falls back on its own.
          checked: selectedIds.includes(library.id) !== pending,
        };
      }),
    [pendingId, selectedIds],
  );

  const installing = pendingId !== null;

  return {
    options,
    toggleLibrary,
    installing,
    toggleDisabled: installing || !executorReady,
    installationFailed,
  };
}
