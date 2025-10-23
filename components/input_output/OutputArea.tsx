/* eslint-disable react/no-array-index-key */
import { isEmpty, negate } from 'lodash';
import {
  CSSProperties,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { splitLines } from '../../src/sourceUtils';
import theme from '../../src/theme';
import InputArea from './InputArea';
import PreElement from './PreElement';
import ImgElement from './ImgElement';

function dataURIPrefix(mime: string) {
  return `data:${mime};base64,`;
}

function isPngData(data: string) {
  return data.startsWith(dataURIPrefix('image/png'));
}

export function isGifData(data: string) {
  return data.startsWith(dataURIPrefix('image/gif'));
}

export const OUTPUT_AREA_BACKGROUND_COLOR = theme.palette.grey[100];

export const OUTPUT_ELEMENT_STYLE = {
  display: 'block',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
};


export const ERROR_MESSAGE_CLASSNAME = 'traceback-error-message';

export type OutputAreaRef = {
  getInput: () => Promise<string>;
  activateInputField: () => void;
};

export function OutputArea({
  data,
  disabled = false,
  sx = {},
  preStyle = {},
  ref = undefined,
}: {
  data: string;
  disabled?: boolean;
  sx?: CSSProperties;
  preStyle?: CSSProperties;
  ref?: Ref<OutputAreaRef>;
}) {
  const resolveInputPromiseRef = useRef<((value: string) => void) | undefined>(
    undefined,
  );
  const [inputFieldActive, setInputFieldActive] = useState(false);
  useImperativeHandle(ref, () => {
    return {
      getInput() {
        return new Promise<string>((resolve) => {
          resolveInputPromiseRef.current = resolve;
        });
      },
      activateInputField() {
        setInputFieldActive(true);
      },
    };
  }, []);
  const pytamaroDataUriRegex =
    /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
  return (
    <div className='output-area' translate='no' style={sx}>
      {data
        .split(pytamaroDataUriRegex)
        .filter(negate(isEmpty))
        .map((chunk, idx, chunks) =>
          isPngData(chunk) || isGifData(chunk) ? (
            <ImgElement key={idx} dataURI={chunk} disabled={disabled} />
          ) : (
            <PreElement
              key={idx}
              lines={splitLines(chunk)}
              style={preStyle}
              activeInput={
                idx === chunks.length - 1 && inputFieldActive ? (
                  <InputArea
                    onSubmit={(result) => {
                      if (resolveInputPromiseRef.current) {
                        setInputFieldActive(false);
                        resolveInputPromiseRef.current(result);
                      }
                    }}
                  />
                ) : undefined
              }
            />
          ),
        )}
    </div>
  );
}
