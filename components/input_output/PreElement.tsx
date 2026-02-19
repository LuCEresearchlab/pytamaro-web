/* eslint-disable react/no-array-index-key */
import { isEmpty, negate } from 'lodash';
import { CSSProperties, ReactElement } from 'react';
import InputArea from './InputArea';
import { INPUT_BEGIN, INPUT_END } from './IoMarkers';
import { OUTPUT_ELEMENT_STYLE } from './OutputArea';

export default function PreElement({
  style = {},
  lines,
  activeInput: input = undefined,
}: {
  style?: CSSProperties;
  lines: string[];
  activeInput?: ReactElement | undefined;
}) {
  return (
    <span style={OUTPUT_ELEMENT_STYLE}>
      {lines.map((line, idx, lines) => {
        const needsActiveInput = idx === lines.length - 1 && input;
        const inputRegex = new RegExp(
          '(' + INPUT_BEGIN + '.*?' + INPUT_END + ')',
          'g',
        );
        const chunks = line.split(inputRegex).filter(negate(isEmpty));
        return (
          <span style={{ display: 'block' }} key={idx}>
            {chunks.map((chunk, chunkIdx) => {
              if (inputRegex.test(chunk)) {
                const inputContent = chunk.slice(
                  INPUT_BEGIN.length,
                  chunk.length - INPUT_END.length,
                );
                return (
                  <InputArea initialContent={inputContent} key={chunkIdx} />
                );
              } else {
                return (
                  <pre
                    key={chunkIdx}
                    style={{
                      margin: 0,
                      display: 'inline-block',
                      verticalAlign: needsActiveInput ? 'top' : undefined,
                      ...style,
                    }}
                  >
                    {chunk}
                  </pre>
                );
              }
            })}
            {needsActiveInput && input}
          </span>
        );
      })}
      {lines.length === 0 && input}
    </span>
  );
}
