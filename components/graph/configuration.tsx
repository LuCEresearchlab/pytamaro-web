import { StateCreator } from 'zustand';
import { ImportReference } from './cards';

export type ErrorLevels = 'prevent' | 'none' | 'warning' | 'highlight';

export type ConfigurationState = {
  error_level: ErrorLevels;
  local_scale: boolean;
  node_filter: ImportReference[];
  setConfiguration: (value: Partial<ConfigurationState>) => void;
};

export const createConfigurationSlice: StateCreator<
  ConfigurationState,
  [],
  [],
  ConfigurationState
> = (set) => ({
  error_level: 'highlight',
  local_scale: true,
  node_filter: [
    {
      module: 'pytamaro',
      name: '*',
    },
  ],
  setConfiguration: set,
});
