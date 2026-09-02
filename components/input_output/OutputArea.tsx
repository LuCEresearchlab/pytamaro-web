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
import { splitLinesWithoutPossibleTrailingNewline } from '../../src/sourceUtils';
import theme from '../../src/theme';
import { TopRightBadge } from '../TopRightBadge';
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

const EVAL_RESULT_STYLE: CSSProperties = {
  width: '100%',
  border: `1px dashed ${theme.palette.primary.main}`,
  margin: 0,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  boxSizing: 'border-box',
};

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
  const outputChunks = parseEvalResultChunks(data);
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
  return (
    <div className='output-area' translate='no' style={sx}>
      {outputChunks.map((outputChunk, outputIdx, chunks) => {
        const graphicOrTextChunks = outputChunk.content
          .split(pytamaroDataUriRegex)
          .filter(negate(isEmpty));
        const isLastOutputChunk = outputIdx === chunks.length - 1;

        const renderedChunk = (
          <>
            {graphicOrTextChunks.map((chunk, idx) =>
              isPngData(chunk) || isGifData(chunk) ? (
                <ImgElement
                  key={`${outputIdx}-${idx}`}
                  dataURI={chunk}
                  disabled={disabled}
                />
              ) : (
                <PreElement
                  key={`${outputIdx}-${idx}`}
                  lines={splitLinesWithoutPossibleTrailingNewline(chunk)}
                  style={preStyle}
                  activeInput={
                    isLastOutputChunk &&
                    idx === graphicOrTextChunks.length - 1 &&
                    inputFieldActive
                      ? inputArea
                      : undefined
                  }
                />
              ),
            )}
          </>
        );

        return outputChunk.isEvalResult ? (
          <Box key={outputIdx} sx={{ width: '100%' }}>
            <TopRightBadge
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
              <div style={EVAL_RESULT_STYLE}>{renderedChunk}</div>
            </TopRightBadge>
          </Box>
        ) : (
          <div key={outputIdx}>{renderedChunk}</div>
        );
      })}
      {
        /* As a special case, render a lone input area if it is active and there is no other output */
        inputFieldActive && outputChunks.length === 0 && (
          <PreElement lines={[]} style={preStyle} activeInput={inputArea} />
        )
      }
    </div>
  );
}
