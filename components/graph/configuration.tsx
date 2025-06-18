import { StateCreator } from 'zustand';

export type ConfigurationState = {
  error_level: 'prevent' | 'none' | 'warning' | 'highlight';
  local_scale: boolean;
};

const default_configuration: ConfigurationState = {
  error_level: 'warning',
  local_scale: false,
};

export const createConfigurationSlice: StateCreator<
  ConfigurationState,
  [],
  [],
  ConfigurationState
> = () => ({
  ...default_configuration,
});
