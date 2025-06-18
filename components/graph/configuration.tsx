import { StateCreator } from 'zustand';

export type ConfigurationState = {
  error_level: 'prevent' | 'none' | 'warning' | 'highlight';
};

const default_configuration: ConfigurationState = {
  error_level: 'warning',
};

export const createConfigurationSlice: StateCreator<
  ConfigurationState,
  [],
  [],
  ConfigurationState
> = () => ({
  ...default_configuration,
});
