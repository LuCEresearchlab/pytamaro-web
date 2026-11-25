import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import type { EditorSession } from './editorSession';
import type { AnalysisResult } from './pythonWorkspace';

const REFRESH_DEBOUNCE_MS = 50;

/**
 * Tracks the analysis result of one file in an editor session.
 *
 * The analysis of a file also changes when *other* files change (e.g., an
 * import), so this listens to the whole session and not only to the file's
 * own edits.
 */
export default function useEditorAnalysisResult(
  editorSession: EditorSession,
  fileName: string,
): AnalysisResult | undefined {
  const [analysisResult, setAnalysisResult] = useState<
    AnalysisResult | undefined
  >(() => editorSession.analyzeFile(fileName));

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      if (!cancelled) {
        setAnalysisResult(editorSession.analyzeFile(fileName));
      }
    };
    // Analysis is cheap but runs synchronously; don't re-render the whole page
    // on every keystroke.
    const debouncedRefresh = debounce(refresh, REFRESH_DEBOUNCE_MS);

    refresh();
    const unsubscribe = editorSession.subscribe(debouncedRefresh);
    return () => {
      cancelled = true;
      debouncedRefresh.cancel();
      unsubscribe();
    };
  }, [editorSession, fileName]);

  return analysisResult;
}
