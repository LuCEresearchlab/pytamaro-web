/* eslint-disable react/no-array-index-key */
import { isEmpty, negate } from 'lodash';
import {
  CSSProperties,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { splitLinesWithoutPossibleTrailingNewline } from '../../src/sourceUtils';
import theme from '../../src/theme';
import ImgElement from './ImgElement';
import InputArea from './InputArea';
import PreElement from './PreElement';

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
  deactivatePossibleInputField: () => void;
};

export function OutputArea({
  data,
  disabled = false,
  sx = {},
  preStyle = {},
  ref = undefined,
  setIsWaitingForInput = () => {},
}: {
  data: string;
  disabled?: boolean;
  sx?: CSSProperties;
  preStyle?: CSSProperties;
  ref?: Ref<OutputAreaRef>;
  setIsWaitingForInput?: (isWaiting: boolean) => void;
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
        setIsWaitingForInput(true);
      },
      deactivatePossibleInputField() {
        setInputFieldActive(false);
        setIsWaitingForInput(false);
      },
    };
  }, [setIsWaitingForInput]);
  const pytamaroDataUriRegex =
    /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
  const inputArea = (
    <InputArea
      onSubmit={(result) => {
        if (resolveInputPromiseRef.current) {
          setInputFieldActive(false);
          resolveInputPromiseRef.current(result);
        }
      }}
    />
  );
  const graphicOrTextChunks = data
    .split(pytamaroDataUriRegex)
    .filter(negate(isEmpty));
  return (
    <div className='output-area' translate='no' style={sx}>
      {graphicOrTextChunks.map((chunk, idx, chunks) =>
        isPngData(chunk) || isGifData(chunk) ? (
          <ImgElement key={idx} dataURI={chunk} disabled={disabled} />
        ) : (
          <PreElement
            key={idx}
            lines={splitLinesWithoutPossibleTrailingNewline(chunk)}
            style={preStyle}
            activeInput={
              idx === chunks.length - 1 && inputFieldActive
                ? inputArea
                : undefined
            }
          />
        ),
      )}
      {
        /* As a special case, render a lone input area if it is active and there is no other output */
        inputFieldActive && graphicOrTextChunks.length === 0 && (
          <PreElement lines={[]} style={preStyle} activeInput={inputArea} />
        )
      }
    </div>
  );
}
