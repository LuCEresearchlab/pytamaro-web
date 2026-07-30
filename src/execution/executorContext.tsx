import { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import { OutputAreaRef } from '../../components/input_output/OutputArea';
import { ToolboxFunction } from '../localStorage/schema';
import { PythonFile } from '../schemas/activitySchema';
import { ExecutionResponse } from './codeExecution';
import { ExecutorClient, ExecutorState } from './executorClient';
import { ExecutorDelegate } from './executorDelegate';
import { ExecutionMetadata } from './messageTypes';

export interface IExecutor {
  executorState: ExecutorState;
  execute: (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    executionMetadata: ExecutionMetadata,
    updateExecutionResult?: (idx: number, response: ExecutionResponse) => void,
    onActiveCellChange?: (before: number | null, after: number) => void,
    getOutputRef?: (idx: number) => OutputAreaRef | null,
  ) => Promise<ExecutionResponse>;
  interruptExecution: () => void;
  restart: () => Promise<void>;
}

export const ExecutorContext = createContext<IExecutor>({
  executorState: { type: 'loading' },
  execute: async () =>
    new Promise((_, reject) =>
      reject(new Error('Pyodide Worker is not ready')),
    ),
  interruptExecution: () => {},
  restart: async () => {},
});

export function ExecutorProvider({ children }: { children: ReactNode }) {
  const [executorState, setExecutorState] = useState<ExecutorState>({
    type: 'loading',
  });

  const executorClientRef = useRef<ExecutorClient | null>(null);
  const setExecutorClientRef = (newRef: ExecutorClient) => {
    executorClientRef.current = newRef;
  };

  const execute = async (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    executionMetadata: ExecutionMetadata,
    updateExecutionResult?: (idx: number, response: ExecutionResponse) => void,
    onActiveCellChange?: (before: number | null, after: number) => void,
    getOutputRef?: (idx: number) => OutputAreaRef | null,
  ) => {
    if (
      executorState.type !== 'available' ||
      executorClientRef.current === null
    ) {
      throw new Error('Executor Worker is not (yet) available');
    }
    return executorClientRef.current.execute(
      sources,
      idx,
      toolboxFunctions,
      extraPythonFiles,
      executionMetadata,
      updateExecutionResult ? updateExecutionResult : () => {},
      onActiveCellChange ? onActiveCellChange : () => {},
      getOutputRef ? getOutputRef : () => null,
    );
  };

  const interruptExecution = () =>
    executorClientRef?.current?.interruptExecution();

  const restart = async () => {
    if (executorClientRef.current !== null) {
      setExecutorClientRef(await executorClientRef.current.restartWorker());
    }
  };

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof SharedArrayBuffer === 'undefined'
    ) {
      // Not in the browser,
      // or not in a browser that supports SharedArrayBuffer
      return;
    }

    ExecutorDelegate.init()
      .then((delegate) => ExecutorClient.init(delegate, setExecutorState))
      .then(setExecutorClientRef)
      .then(() => setExecutorState({ type: 'available' }));
  }, []);

  return (
    <ExecutorContext
      value={{
        executorState,
        execute,
        interruptExecution,
        restart,
      }}
    >
      {children}
    </ExecutorContext>
  );
}
