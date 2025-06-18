import { StateCreator } from 'zustand';

export type ErrorMessageType = 'syntax' | 'type' | 'missing_parameter';

export interface ErrorMessage {
  nodeId: string;
  handle?: string;
  type: ErrorMessageType;
}

export interface ErrorState {
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

export const createErrorSlice: StateCreator<ErrorState, [], [], ErrorState> = (
  set,
  get,
) => ({
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

  getErrors: () => get().errors,
  setErrors: (errors) => {
    set(() => ({ errors }));
  },
});
