import { StateCreator } from 'zustand';
import { ImportReference } from './cards';

export type ConfigurationState = {
  error_level: 'prevent' | 'none' | 'warning' | 'highlight';
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
  error_level: 'warning',
  local_scale: false,
  node_filter: [
    {
      module: 'pytamaro',
      name: '*',
    },
  ],
  setConfiguration: set,
});
