import produce from 'immer';
import { ToolboxFunction } from './schema';
import useLocalProfile from './useLocalProfile';

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

  const replaceFunction = (fn: ToolboxFunction) => {
    const idx = metadata.toolbox.findIndex((t) => t.name === fn.name);
    if (idx === -1) {
      return false;
    }
    setMetadata(
      (currentMetadata) => produce(currentMetadata, (draft) => {
        draft.toolbox[idx] = fn;
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
    replaceFunction,
    deleteFunction,
    list,
    exists,
  };
}
