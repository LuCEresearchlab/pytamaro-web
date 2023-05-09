const EOL = '\n';

export function countLines(source: string) {
  return source.split(EOL).length;
}

export function joinLines(lines: string[]) {
  return lines.join(EOL);
}

export function emptyLines(n: number) {
  return EOL.repeat(n);
}
