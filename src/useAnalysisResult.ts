import { reverse, uniqWith } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import {
  AnalysisResult,
  PythonFunction,
} from './python-analyzer/python_analyzer';
import { PythonAnalyzer } from './usePythonAnalyzer';

export function visibleDefinedFunctions(
  analysisResult?: AnalysisResult | undefined,
): PythonFunction[] {
  if (!analysisResult) {
    return [];
  }
  // Double reverse to bias uniqWith towards the latest definition, in case of duplicates
  return reverse(
    uniqWith(
      reverse(analysisResult.defined_functions),
      (f1, f2) => f1.name === f2.name,
    ),
  );
}

export default function useAnalysisResult(
  pythonAnalyzer: PythonAnalyzer | null,
  cellIdx: number,
): AnalysisResult | undefined {
  // Register for analysis results for this cell
  const [analysisResult, setAnalysisResult] = useState<
    AnalysisResult | undefined
  >(undefined);
  const handleNewAnalysisResult = useCallback(() => {
    setAnalysisResult(pythonAnalyzer?.getAnalysisResult(cellIdx));
  }, [cellIdx, pythonAnalyzer]);
  useEffect(() => {
    if (pythonAnalyzer) {
      pythonAnalyzer.addNewAnalysisResultListener(
        cellIdx,
        handleNewAnalysisResult,
      );
    }
    return () => {
      if (pythonAnalyzer) {
        pythonAnalyzer.removeNewAnalysisResultListener(
          cellIdx,
          handleNewAnalysisResult,
        );
      }
    };
  }, [handleNewAnalysisResult, pythonAnalyzer, cellIdx]);
  return analysisResult;
}
