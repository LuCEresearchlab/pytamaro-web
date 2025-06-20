import { StateCreator } from 'zustand';
import { GraphStateSlice } from './store';

export type ErrorMessageType = 'syntax' | 'type' | 'missing_parameter';

export interface ErrorMessage {
  nodeId: string;
  handle?: string;
  type: ErrorMessageType;
}

export interface ErrorStateSlice {
  errors: ErrorMessage[];

  addError: (
    nodeId: string,
    handle: string | undefined,
    type: ErrorMessageType,
  ) => void;
  removeError: (
    nodeId: string,
    handle?: string,
    type?: ErrorMessageType,
  ) => void;
  clearErrors: (nodeId: string) => void;

  getErrors: () => ErrorMessage[];
  setErrors: (errrors: ErrorMessage[]) => void;
}

export const createErrorSlice: StateCreator<
  ErrorStateSlice & GraphStateSlice,
  [],
  [],
  ErrorStateSlice
> = (set, get) => ({
  errors: [],

  addError: (nodeId, handle, type) => {
    set((state) => ({
      errors: state.errors
        .filter((v) => !(v.nodeId === nodeId && v.handle === handle))
        .concat({ nodeId, handle, type }),
    }));
  },

  removeError: (nodeId, handle, type) => {
    set((state) => ({
      errors: state.errors.filter(
        (err) =>
          !(
            err.nodeId === nodeId &&
            err.handle === handle &&
            (!type || type === err.type)
          ),
      ),
    }));
  },

  clearErrors: (nodeId) => {
    set((state) => ({
      errors: state.errors.filter((err) => err.nodeId !== nodeId),
    }));
  },

  getErrors: () => {
    const state = get();
    const errors_length = state.errors.length;

    const new_errors = state.errors.filter((v) =>
      state.nodes.find((o) => o.id === v.nodeId),
    );

    if (new_errors.length === errors_length) return state.errors;
    set({ errors: new_errors });
    return new_errors;
  },
  setErrors: (errors) => {
    set(() => ({ errors }));
  },
});
