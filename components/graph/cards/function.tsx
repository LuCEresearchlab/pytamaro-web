import { NodeProps } from '@xyflow/react';
import { CodeRepresentation, IImportedCardData } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import { createCodeFromCodeRepresentation, toEnglishName } from '../utils';
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

export function GraphicIcon({
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
      code &&
      function_el.returnValue &&
      function_el.returnValue.type === 'Graphic'
        ? createCodeFromCodeRepresentation(code)
        : undefined;

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

  return dimension ? (
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
  ) : undefined;
}

export function ColorIcon({
  data,
}: NodeProps & { data: ITamaroFunctionCardData }) {
  const function_el = data.value;

  const code = useMemo(
    () =>
      data.representation
        ? ({
            expression: `color = ${data.representation.expression}\nprint(color.red)\nprint(color.green)\nprint(color.blue)\nprint(color.alpha)`,
            imports: data.representation.imports.concat({
              module: 'pytamaro',
              name: 'show_graphic',
            }),
          } as CodeRepresentation)
        : undefined,
    [data.representation],
  );

  const [color, setColor] = useState(
    undefined as
      | { red: number; green: number; blue: number; alpha: number }
      | undefined,
  );

  useEffect(() => {
    const returns_expression =
      code &&
      function_el.returnValue &&
      function_el.returnValue.type === 'Color'
        ? createCodeFromCodeRepresentation(code)
        : undefined;

    if (returns_expression) {
      setColor(undefined);
      executeOnServer([returns_expression], 0, [], [])
        .catch(() => undefined)
        .then((v) => (v?.type === 'success' ? v.stdout : undefined))
        .then((data) => {
          const lines = (data || '').split('\n').map((v) => v.trim());
          if (lines.length !== 5) return undefined;

          const [red, green, blue, alpha] = lines.map(Number.parseFloat);
          setColor({ red, green, blue, alpha });
        });
    }
  }, [code, function_el]);

  return (
    color && (
      <svg
        width='32'
        height='32'
        viewBox='0 0 146 128'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M37.3259 127.654C58.2429 127.486 68.739 113.651 70.39 101.306C73.318 79.406 47.3769 66.771 31.6169 82.191C23.2219 90.404 20.1029 103.804 0.158936 107.03C0.158936 107.03 8.50593 127.886 37.3259 127.654Z'
          fill={`rgba(${color.red}, ${color?.green}, ${color?.blue}, ${color?.alpha})`}
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M57.137 68.3359L126.091 2.30795C136.013 -2.13905 147.492 3.24795 144.656 17.994L77.4609 88.3179C74.9499 77.9429 65.151 70.4579 57.137 68.3359Z'
          fill={`rgba(0, 0, 0, ${color?.alpha})`}
        />
      </svg>
    )
  );
}

export function TamaroFunctionCard(
  props: NodeProps & { data: ITamaroFunctionCardData },
) {
  const { data } = props;
  const function_el = data.value;

  const en_name = function_el.returnValue?.type
    ? toEnglishName(function_el.returnValue?.type)
    : undefined;

  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      {function_el && (
        <FunctionTamaroCard
          el={function_el}
          module={data.module}
          show_handles
          returns_icon={
            function_el.returnValue && en_name
              ? en_name === 'Graphic' || en_name === 'Color'
                ? { Graphic: GraphicIcon, Color: ColorIcon }[en_name](props)
                : undefined
              : undefined
          }
        />
      )}
    </div>
  );
}
