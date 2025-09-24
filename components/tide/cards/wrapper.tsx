import { NodeProps } from '@xyflow/react';
import { TideNode } from '.';

export default function TamaroWrapper({
  nodeprops,
  el,
}: {
  nodeprops: NodeProps<TideNode>;
  el: JSX.Element;
}) {
  const node = nodeprops.data.tide_node;

  const error =
    node && 'type' in node
      ? typeof node.type === 'object' && 'error' in node.type
        ? node.type.error
        : node.type === false
          ? false
          : undefined
      : undefined;

  const primary_error = error != null && error !== false;
  const secondary_error = error === false;

  return (
    <div
      className={`${primary_error ? 'error-main-highlight ' : ''}${secondary_error ? 'error-secondary-highlight' : ''}`}
    >
      {el}
    </div>
  );
}
