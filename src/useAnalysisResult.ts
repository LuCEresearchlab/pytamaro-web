import { uniqBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import type { ActivitySession } from './activitySession';
import type { PythonFunction } from './python-analyzer/python_analyzer';
import { AnalysisResult } from './pythonWorkspace';

export function visibleDefinedFunctions(
  analysisResult?: Pick<AnalysisResult, 'defined_functions'>,
): PythonFunction[] {
  if (!analysisResult) {
    return [];
  }
  // Double reverse to bias uniqBy towards the latest definition, in case of duplicates
  const latestFirst = analysisResult.defined_functions.slice().reverse();
  return uniqBy(latestFirst, (fn) => fn.name).reverse();
}

export default function useAnalysisResult(
  activitySession: ActivitySession,
  cellIdx: number,
): AnalysisResult | undefined {
  // Register for analysis results for this cell
  const [analysisResult, setAnalysisResult] = useState<
    AnalysisResult | undefined
  >(undefined);
  const handleNewAnalysisResult = useCallback(() => {
    setAnalysisResult(activitySession.getAnalysisResult(cellIdx));
  }, [activitySession, cellIdx]);
  useEffect(() => {
    activitySession.addNewAnalysisResultListener(
      cellIdx,
      handleNewAnalysisResult,
    );
    // The analysis may have completed before this listener was registered.
    handleNewAnalysisResult();
    return () => {
      activitySession.removeNewAnalysisResultListener(
        cellIdx,
        handleNewAnalysisResult,
      );
    };
  }, [handleNewAnalysisResult, activitySession, cellIdx]);
  return analysisResult;
}
