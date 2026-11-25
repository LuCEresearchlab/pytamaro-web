import { useCallback, useEffect, useRef } from 'react';
import type { OutputAreaRef } from '../components/input_output/OutputArea';
import type { InputRequester } from './execution/executorClient';

/**
 * Serves the executor's requests for a line of input.
 *
 * The executor only knows cell indices. This hook owns everything about the UI
 * side of an input request: it makes the output area of the cell visible,
 * waits until React has mounted it, activates the input field, and returns what
 * the user typed. If the request is aborted (execution interrupted), the input
 * field is deactivated and the returned promise rejects.
 */
export default function useInputRequests(
  showOutputArea: (cellIdx: number) => void,
) {
  const outputAreas = useRef(new Map<number, OutputAreaRef>());
  const mountListeners = useRef(new Set<() => void>());

  // Use the latest `showOutputArea` without making `requestInput` change
  // identity on every render.
  const showOutputAreaRef = useRef(showOutputArea);
  useEffect(() => {
    showOutputAreaRef.current = showOutputArea;
  });

  const setOutputAreaRef = useCallback(
    (cellIdx: number, node: OutputAreaRef | null | undefined) => {
      if (node === null || node === undefined) {
        outputAreas.current.delete(cellIdx);
        return;
      }
      outputAreas.current.set(cellIdx, node);
      mountListeners.current.forEach((listener) => listener());
    },
    [],
  );

  const requestInput: InputRequester = useCallback(async (cellIdx, signal) => {
    const aborted = new Promise<never>((_, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), {
        once: true,
      });
    });

    showOutputAreaRef.current(cellIdx);

    let cleanupListener: (() => void) | undefined;

    const inputSubmitted = new Promise<string>((resolve) => {
      const attachToOutputArea = () => {
        const area = outputAreas.current.get(cellIdx);
        if (area) {
          area.activateInputField();
          area.getInput().then(resolve);
        }
      };

      mountListeners.current.add(attachToOutputArea);
      cleanupListener = () => mountListeners.current.delete(attachToOutputArea);

      // Attach immediately if OutputArea is already mounted
      attachToOutputArea();
    });

    try {
      return await Promise.race([inputSubmitted, aborted]);
    } finally {
      cleanupListener?.();
      outputAreas.current.get(cellIdx)?.deactivatePossibleInputField();
    }
  }, []);

  return { setOutputAreaRef, requestInput };
}
