import { createElement, ReactNode } from 'react';

// Non-greedy match to find all code fragments.
const BACKTICKS_REGEX = /`(.*?)`/g;

export function convertMarkdownCodeTagsToHTML(message: string) {
  // Content may include backticks for code fragments, find them and replace with <code> elements.
  return message.replaceAll(BACKTICKS_REGEX, `<code>$1</code>`);
}

export function toSpanAndCodeElements(message: string): ReactNode[] {
  const elements: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(BACKTICKS_REGEX); // Create a new regex instance to reset lastIndex
  while ((match = regex.exec(message)) !== null) {
    // Add text before the code span as a regular span
    if (match.index > lastIndex) {
      elements.push(
        createElement(
          'span',
          { key: lastIndex },
          message.slice(lastIndex, match.index),
        ),
      );
    }
    // Add the code span as a <code> element
    elements.push(createElement('code', { key: match.index }, match[1]));
    lastIndex = regex.lastIndex;
  }
  // Add any remaining text after the last code span
  if (lastIndex < message.length) {
    elements.push(
      createElement('span', { key: lastIndex }, message.slice(lastIndex)),
    );
  }
  return elements;
}
