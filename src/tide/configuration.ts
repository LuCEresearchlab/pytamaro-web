import { StateCreator } from 'zustand';
import { ImportedDefinition } from './language/definitions';
import { TideJudiciousMetadata } from './judiciours_to_tide';
import { StoreType } from './store';
import { TideNode } from '../../components/tide/cards';

export type ErrorLevels = 'prevent' | 'none' | 'warning' | 'highlight';

export type ConfigurationState = {
  error_level: ErrorLevels;
  local_scale: boolean;
  imported_definitions: ImportedDefinition<
    TideJudiciousMetadata,
    'evaluated'
  >[];
  functional_nodes_only: boolean;
  setConfiguration: (value: Partial<ConfigurationState>) => void;
};

export const createConfigurationSlice: StateCreator<
  StoreType,
  [],
  [],
  ConfigurationState
> = (set, get) => ({
  error_level: 'highlight',
  local_scale: true,
  functional_nodes_only: true,
  imported_definitions: [],
  setConfiguration: (value) => {
    set(value);
    get().setNodes(
      get().nodes.map(
        (v) => ({ ...v, data: { ...v.data, outdated: true } }) as TideNode,
      ),
    );
  },
});
