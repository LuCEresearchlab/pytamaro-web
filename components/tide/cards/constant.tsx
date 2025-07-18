import { NodeProps } from '@xyflow/react';
import { ExtraneousNodeProps, ConstantNode } from '.';
import { JudiciousConstant } from '../../../src/schemas/documentation';
import { ConstantTamaroCard } from '../../TamaroCard';
import useJudiciousDocData from '../../../src/documentation';
import ResultIcon from '../ResultIcon';
import { useMemo } from 'react';

export function TamaroConstantCard({
  data,
  show_handles,
}: NodeProps<ConstantNode> & ExtraneousNodeProps) {
  const i = data.import as { module: string; name: string };

  const [el] = useJudiciousDocData([i.module]).map(
    (v) =>
      v.elements.find((o) => o.name === i.name) as
        | JudiciousConstant
        | undefined,
  );

  const value = data.evaluated ? data.value : undefined;
  const returns_icon = useMemo(() => {
    return ResultIcon({ value });
  }, [value]);

  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals'>
      {el && (
        <ConstantTamaroCard
          el={el}
          module={i.module}
          show_handles={show_handles}
          returns_icon={returns_icon}
        />
      )}
    </div>
  );
}
