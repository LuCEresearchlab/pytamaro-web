import { createContext, useContext, useState } from 'react';

const DnDContext = createContext([null, () => {}]);

export const DnDProvider = ({ children }: any) => {
  const [nodeData, setNodeData] = useState(
    null as { type: string; data: any } | null,
  );

  return (
    <DnDContext.Provider value={[nodeData, setNodeData] as any}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

export const useDnD = () => {
  return useContext(DnDContext);
};
