import { useSyncExternalStore } from 'react';

export function useIsHydrated() {
  // Taken from https://github.com/astoilkov/use-local-storage-state/pull/74#issuecomment-2468144099
  const isServerOrHydrating = useSyncExternalStore(
    () => () => {},
    () => false,
    () => true,
  );

  return !isServerOrHydrating;
}
