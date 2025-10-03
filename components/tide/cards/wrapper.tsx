import { NodeProps } from '@xyflow/react';
import { JSX } from 'react';
import { TideNode } from '.';
import { extract_error } from '../../../src/tide/language/utils';

export default function TamaroWrapper({
  nodeprops,
  el,
}: {
  nodeprops: NodeProps<TideNode>;
  el: JSX.Element;
}) {
  const node = nodeprops.data.tide_node;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = extract_error(node as any);

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
