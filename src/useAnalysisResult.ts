import { useCallback, useEffect, useState } from 'react';
import { AnalysisResult } from './python-analyzer/python_analyzer';
import { PythonAnalyzer } from './usePythonAnalyzer';

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
