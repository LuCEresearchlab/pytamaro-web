import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ToolboxFunction } from '../localStorage/schema';
import { ExecutionResponse, PythonMode } from './codeExecution';
import {
  ExecutorClient,
  ExecutorState,
  type InputRequester,
} from './executorClient';
import { ExecutorDelegate } from './executorDelegate';
import { ExecutionMetadata, RunPythonFile } from './messageTypes';

export interface IExecutor {
  executorState: ExecutorState;
  execute: (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: RunPythonFile[],
    executionMetadata: ExecutionMetadata,
    pythonMode: PythonMode,
    updateExecutionResult?: (idx: number, response: ExecutionResponse) => void,
    onActiveCellChange?: (before: number | null, after: number) => void,
    requestInput?: InputRequester,
    fileNames?: string[],
    workspaceFiles?: string[],
  ) => Promise<ExecutionResponse>;
  interruptExecution: () => void;
  restart: () => Promise<void>;
  configureLibraries: (libraries: readonly string[]) => Promise<void>;
}

export const ExecutorContext = createContext<IExecutor>({
  executorState: { type: 'loading' },
  execute: async () =>
    new Promise((_, reject) =>
      reject(new Error('Pyodide Worker is not ready')),
    ),
  interruptExecution: () => {},
  restart: async () => {},
  configureLibraries: async () => {
    throw new Error('Pyodide Worker is not ready');
  },
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
    extraPythonFiles: RunPythonFile[],
    executionMetadata: ExecutionMetadata,
    pythonMode: PythonMode,
    updateExecutionResult?: (idx: number, response: ExecutionResponse) => void,
    onActiveCellChange?: (before: number | null, after: number) => void,
    requestInput?: InputRequester,
    fileNames: string[] = [],
    workspaceFiles: string[] | undefined = undefined,
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
      pythonMode,
      updateExecutionResult ? updateExecutionResult : () => {},
      onActiveCellChange ? onActiveCellChange : () => {},
      requestInput,
      fileNames,
      workspaceFiles,
    );
  };

  const interruptExecution = () =>
    executorClientRef?.current?.interruptExecution();

  const restart = useCallback(async () => {
    if (executorClientRef.current !== null) {
      setExecutorClientRef(await executorClientRef.current.restartWorker());
    }
  }, []);

  const executorAvailable = executorState.type === 'available';

  const configureLibraries = useCallback(
    async (libraries: readonly string[]) => {
      const client = executorClientRef.current;
      if (!executorAvailable || client === null) {
        throw new Error('Executor Worker is not (yet) available');
      }
      await client.configureLibraries(libraries);
      if (client.hasStaleLibraries(libraries)) {
        await restart();
        // The restart swallows install errors. Retrying on the new client is
        // a no-op on success and reports the failure otherwise.
        await executorClientRef.current?.configureLibraries(libraries);
      }
    },
    [executorAvailable, restart],
  );

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
        configureLibraries,
      }}
    >
      {children}
    </ExecutorContext>
  );
}
