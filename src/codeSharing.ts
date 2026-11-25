import { debounce } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { singleCodeCell } from '../components/SolitaryCodeCell';
import type { ActivitySession } from './activitySession';
import useLocalTranslation from './localStorage/useLocalTranslation';

/** Compresses `source` into the base64-encoded gzip used in URLs. */
export async function compressCode(source: string): Promise<string> {
  const stream = new Blob([source], { type: 'text/plain' })
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return Buffer.from(buf).toString('base64');
}

/** Decompresses the base64-encoded gzip stored in URLs. */
export async function decompressCode(encoded: string): Promise<string> {
  const response = await fetch(
    'data:application/octet-stream;base64,' + encoded,
  );
  const blob = await response.blob();
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return Buffer.from(buf).toString();
}

/**
 * URL of the current page with `source` in the compressed `c` query parameter.
 *
 * Any legacy uncompressed `code` parameter is dropped, so the code is not kept
 * in the URL in clear text.
 */
export async function urlWithCompressedCode(source: string): Promise<string> {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.set('c', await compressCode(source));
  return url.toString();
}

/**
 * Returns a debounced function that keeps the compressed `c` parameter of the
 * current URL in sync with the given source.
 */
export function useSharedCodeUrlUpdater(): (source: string) => void {
  const updateUrl = useMemo(
    () =>
      debounce((source: string) => {
        urlWithCompressedCode(source)
          .then((url) => {
            window.history.replaceState({}, '', url);
          })
          .catch(() => {
            // Keep the current URL if the code cannot be compressed.
          });
      }, 1000),
    [],
  );

  useEffect(() => () => updateUrl.cancel(), [updateUrl]);

  return updateUrl;
}

/**
 * Loads the code shared through the URL into a single-cell activity.
 *
 * The compressed `c` parameter is always supported; the legacy uncompressed
 * `code` parameter is only read when `allowUncompressedCode` is true. If the
 * user has already changed the code, asks for confirmation before replacing
 * it.
 */
export function useSharedCodeFromQuery({
  activitySession,
  onReplace,
  allowUncompressedCode = false,
  confirmDescription,
}: {
  activitySession: ActivitySession;
  onReplace: () => void;
  allowUncompressedCode?: boolean;
  confirmDescription?: string;
}) {
  const { query } = useRouter();
  const { t } = useLocalTranslation(['common']);
  const confirm = useConfirm();
  const codeFromQuery = query?.code;
  const compressedCodeFromQuery = query?.c;

  useEffect(
    () => {
      const replaceCode = (newCode: string) => {
        activitySession.replaceInitialCodeCells(singleCodeCell(newCode));
        onReplace();
      };

      const setCodeFromQuery = (queryCode: string) => {
        const userCode = activitySession.getSource(0);
        if (userCode === queryCode) {
          return;
        }
        if (userCode === activitySession.getInitialSource(0)) {
          replaceCode(queryCode);
        } else {
          confirm({
            title: t('resetAreYouSure'),
            description: confirmDescription ?? t('replaceSharedCodeWarning'),
            confirmationText: t('replaceSharedCodeConfirm'),
            cancellationText: t('confirmCancel'),
          }).then(({ confirmed }) => {
            if (confirmed) {
              replaceCode(queryCode);
            }
          });
        }
      };

      if (typeof compressedCodeFromQuery === 'string') {
        decompressCode(compressedCodeFromQuery)
          .then(setCodeFromQuery)
          .catch(() => {});
      } else if (allowUncompressedCode && typeof codeFromQuery === 'string') {
        setCodeFromQuery(
          Buffer.from(codeFromQuery, 'base64').toString('utf-8'),
        );
      }
    },
    // We need to run this only once, when the query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeFromQuery, compressedCodeFromQuery, allowUncompressedCode],
  );
}
