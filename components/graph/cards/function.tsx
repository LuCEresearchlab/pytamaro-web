import { NodeProps } from '@xyflow/react';
import { CodeRepresentation, IImportedCardData } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import { createCodeFromCodeRepresentation } from '../utils';
import { useEffect, useMemo, useState } from 'react';
import { executeOnServer } from '../../../src/useActivity';
import { isEmpty, negate } from 'lodash';

export interface ITamaroFunctionCardData extends IImportedCardData {
  value: JudiciousFunction;
  size?: { width: number; height: number };
}

export function getHandleName(parameter_name: string) {
  return `input_${parameter_name}`;
}

export function getParameterName(handle_name: string) {
  return handle_name.startsWith('input_')
    ? handle_name.substring('input_'.length)
    : undefined;
}

export function TamaroFunctionCard({
  data,
}: NodeProps & { data: ITamaroFunctionCardData }) {
  const function_el = data.value;

  const code = useMemo(
    () =>
      data.representation
        ? ({
            expression: `show_graphic(${data.representation.expression})`,
            imports: data.representation.imports.concat({
              module: 'pytamaro',
              name: 'show_graphic',
            }),
          } as CodeRepresentation)
        : undefined,
    [data.representation],
  );

  const [imgData, setImgData] = useState(undefined as string | undefined);
  const [dimension, setDimension] = useState(
    undefined as { width: number; height: number } | undefined,
  );

  const IMG_SCALE = 0.2;

  useEffect(() => {
    const returns_expression =
      code && function_el.returnValue
        ? createCodeFromCodeRepresentation(code)
        : undefined;
    console.log('RUNS');
    if (returns_expression) {
      executeOnServer([returns_expression], 0, [], [])
        .catch(() => undefined)
        .then((v) => (v?.type === 'success' ? v.stdout : undefined))
        .then((data) => {
          if (!data) return undefined;
          const pytamaroDataUriRegex =
            /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
          return data.split(pytamaroDataUriRegex).filter(negate(isEmpty))[0];
        })
        .then(async (data) => {
          if (!data) return undefined;
          return await new Promise<string>(function (resolved, rejected) {
            const i = new Image();
            i.onload = function () {
              setDimension({
                width: i.naturalWidth * IMG_SCALE,
                height: i.naturalHeight * IMG_SCALE,
              });
              resolved(data);
            };
            i.onerror = rejected;
            i.src = data;
          });
        })
        .then(setImgData);
    }
  }, [code, function_el.returnValue]);

  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      {function_el && (
        <FunctionTamaroCard
          el={function_el}
          module={data.module}
          show_handles
          returns_icon={
            dimension ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                style={{
                  width: `${dimension.width}px`,
                  height: `${dimension.height}px`,
                }}
                className='img'
                alt='Expression Result'
                src={imgData}
              />
            ) : undefined
          }
        />
      )}
    </div>
  );
}
