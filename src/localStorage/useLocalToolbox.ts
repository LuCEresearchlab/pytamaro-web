import produce from 'immer';
import useLocalProfile from './useLocalProfile';
import { ToolboxFunction } from './schema';

export default function useLocalToolbox() {
  const { metadata, setMetadata } = useLocalProfile();

  const getFunction = (name: string) => metadata.toolbox.find((t) => t.name === name);

  const exists = (name: string) => Boolean(getFunction(name));

  const add = (fn: ToolboxFunction) => {
    if (getFunction(fn.name)) {
      return false;
    }
    setMetadata(
      (currentMetadata) => produce(currentMetadata, (draft) => {
        draft.toolbox.push(fn);
      }),
    );
    return true;
  };

  const deleteFunction = (fn: ToolboxFunction) => {
    setMetadata(
      (currentMetadata) => produce(currentMetadata, (draft) => {
        draft.toolbox = draft.toolbox.filter((t) => t.name !== fn.name);
      }),
    );
  };

  const list = () => metadata.toolbox;

  return {
    add,
    getFunction,
    deleteFunction,
    list,
    exists,
  };
}
