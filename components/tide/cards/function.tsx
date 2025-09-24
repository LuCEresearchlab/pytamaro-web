import { NodeProps } from '@xyflow/react';
import { ExtraneousNodeProps, FunctionNode } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import ResultIcon from '../ResultIcon';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../../src/tide/store';
import { useShallow } from 'zustand/shallow';
import { Location } from '../../../src/tide/language/types';
import {
  EvaluatedValueType,
  SoundType,
} from '../../../src/tide/language/typing';
import { module_elements } from '../../../src/tide/utils';

export function getHandleName(parameter_name: string) {
  return `input_${parameter_name}`;
}

export function getParameterName(handle_name: string) {
  return handle_name.startsWith('input_')
    ? handle_name.substring('input_'.length)
    : undefined;
}

export function TideFunctionuse({
  data,
  show_handles,
}: Pick<
  NodeProps<FunctionNode> & ExtraneousNodeProps,
  'id' | 'data' | 'show_handles'
>) {
  const judicious = useStore(useShallow((state) => state.judicious));

  const elements = useMemo(() => module_elements(judicious), [judicious]);

  const i =
    data.tide_node && 'location' in data.tide_node
      ? (data.tide_node.location as Location<string>)
      : elements
          .filter((v) => v.name === data.input)
          .map((v) => ({ module: v.module, name: v.name }))
          .find(() => true);

  const [el, setEl] = useState(undefined as undefined | JudiciousFunction);

  useEffect(() => {
    if (!i) {
      setEl(undefined);
      return;
    }

    setEl(
      elements.find((v) => v.module === i.module && v.name === i.name) as
        | JudiciousFunction
        | undefined,
    );
  }, [data.input, i, elements]);

  const value =
    data.tide_node && 'data' in data.tide_node
      ? (data.tide_node.data as EvaluatedValueType[SoundType])
      : undefined;

  const result_icon = useMemo(() => {
    return ResultIcon({ value });
  }, [value]);

  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      {el && i && (
        <FunctionTamaroCard
          el={el}
          module={i.module}
          show_handles={show_handles}
          returns_icon={result_icon}
        />
      )}
    </div>
  );
}
