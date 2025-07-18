import { NodeProps } from '@xyflow/react';
import { TamaroCardNode } from '.';
import { UnsoundType, Value } from '../../../src/tide/language/expression';

export default function TamaroWrapper({
  nodeprops,
  el,
}: {
  nodeprops: NodeProps<TamaroCardNode>;
  el: JSX.Element;
}) {
  const value = nodeprops.data.evaluated
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((nodeprops.data as any)['value'] as Value)
    : undefined;

  const primary_error =
    value && value.type === UnsoundType.Bottom && value.error !== false;

  const secondary_error =
    !primary_error &&
    value &&
    value.type === UnsoundType.Bottom &&
    value.error === false;
  return (
    <div
      className={`${primary_error ? 'error-main-highlight ' : ''}${secondary_error ? 'error-secondary-highlight' : ''}`}
    >
      {el}
    </div>
  );
}
