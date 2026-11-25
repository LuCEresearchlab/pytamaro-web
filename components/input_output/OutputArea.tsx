/* eslint-disable react/no-array-index-key */
import { Calculate } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { isEmpty, negate } from 'lodash';
import {
  CSSProperties,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  splitLines,
  splitLinesWithoutPossibleTrailingNewline,
} from '../../src/sourceUtils';
import theme from '../../src/theme';
import { OverhangingBadge } from '../OverhangingBadge';
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

function isImageData(data: string) {
  return isPngData(data) || isGifData(data);
}

export const OUTPUT_AREA_BACKGROUND_COLOR = theme.palette.grey[100];

export const OUTPUT_ELEMENT_STYLE = {
  display: 'block',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
};

export const ERROR_MESSAGE_CLASSNAME = 'traceback-error-message';

const EVAL_RESULT_STYLE: CSSProperties = {
  width: '100%',
  margin: 0,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  boxSizing: 'border-box',
};

const PYTAMARO_DATA_URI_REGEX =
  /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;

type OutputChunk = {
  content: string;
  isEvalResult: boolean;
};

function parseEvalResultChunks(data: string): OutputChunk[] {
  const evalResultRegex =
    /@@@EVAL_RESULT_BEGIN@@@([\s\S]*?)@@@EVAL_RESULT_END@@@/g;
  const chunks: OutputChunk[] = [];
  let lastIndex = 0;
  let match = evalResultRegex.exec(data);

  while (match) {
    const [fullMatch, evalResultContent] = match;
    const matchStart = match.index;

    if (matchStart > lastIndex) {
      chunks.push({
        content: data.slice(lastIndex, matchStart),
        isEvalResult: false,
      });
    }

    chunks.push({ content: evalResultContent, isEvalResult: true });
    lastIndex = matchStart + fullMatch.length;
    match = evalResultRegex.exec(data);
  }

  if (lastIndex < data.length) {
    chunks.push({ content: data.slice(lastIndex), isEvalResult: false });
  }

  return chunks.filter((chunk) => !isEmpty(chunk.content));
}

function splitGraphicsAndText(content: string): string[] {
  return content.split(PYTAMARO_DATA_URI_REGEX).filter(negate(isEmpty));
}

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

  const inputArea = (
    <InputArea
      onSubmit={(result) => {
        const resolve = resolveInputPromiseRef.current;
        if (resolve) {
          resolveInputPromiseRef.current = undefined;
          setInputFieldActive(false);
          resolve(result);
        }
      }}
    />
  );

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

  const outputChunks = parseEvalResultChunks(data).map((chunk) => ({
    ...chunk,
    parts: splitGraphicsAndText(chunk.content),
  }));

  // The active input is shown at the end of the output, on the last line of
  // the last part if that is text. If there is no output, or the output ends
  // with a graphic, there is no line to attach it to: render it on its own.
  const lastChunk = outputChunks[outputChunks.length - 1];
  const lastPart = lastChunk?.parts[lastChunk.parts.length - 1];
  const inputAttachedToText =
    inputFieldActive && lastPart !== undefined && !isImageData(lastPart);
  const inputStandalone = inputFieldActive && !inputAttachedToText;

  return (
    <div data-testid='output-area' translate='no' style={sx}>
      {outputChunks.map((outputChunk, outputIdx, chunks) => {
        const isLastOutputChunk = outputIdx === chunks.length - 1;
        const { parts } = outputChunk;

        const renderedChunk = (
          <>
            {parts.map((part, idx) => {
              if (isImageData(part)) {
                return (
                  <ImgElement
                    key={`${outputIdx}-${idx}`}
                    dataURI={part}
                    disabled={disabled}
                  />
                );
              }

              const hasActiveInput =
                inputAttachedToText &&
                isLastOutputChunk &&
                idx === parts.length - 1;
              return (
                <PreElement
                  key={`${outputIdx}-${idx}`}
                  // Finished output drops its trailing newline (it only terminates the last line).
                  // But a waiting input goes where the "cursor" is, at the end of the output, so keep
                  // the newline.
                  lines={
                    hasActiveInput
                      ? splitLines(part)
                      : splitLinesWithoutPossibleTrailingNewline(part)
                  }
                  style={preStyle}
                  activeInput={hasActiveInput ? inputArea : undefined}
                />
              );
            })}
          </>
        );

        return outputChunk.isEvalResult ? (
          <Box key={outputIdx} sx={{ width: '100%' }}>
            <OverhangingBadge
              sx={{
                '& .MuiBadge-badge': {
                  top: theme.spacing(0.25),
                  backgroundColor: theme.palette.primary.main,
                },
              }}
              badgeContent={
                <Tooltip arrow placement='bottom' title='Evaluation result'>
                  <Calculate fontSize='small' />
                </Tooltip>
              }
            >
              <div className='eval-result-output' style={EVAL_RESULT_STYLE}>
                {renderedChunk}
              </div>
            </OverhangingBadge>
          </Box>
        ) : (
          <div key={outputIdx}>{renderedChunk}</div>
        );
      })}
      {inputStandalone && (
        <PreElement lines={[]} style={preStyle} activeInput={inputArea} />
      )}
    </div>
  );
}
