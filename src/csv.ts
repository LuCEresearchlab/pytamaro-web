/** The separators the CSV preview can parse. */
export type CsvSeparator = ',' | ';' | '\t';

/**
 * Guesses the separator for a CSV/TSV-like file.
 */
export function guessSeparator(
  name: string,
  content: Uint8Array,
): CsvSeparator {
  if (name.endsWith('.tsv')) {
    return '\t';
  }

  let idx = 0;
  let inQuotes = false;

  while (idx < content.length) {
    const byte = content[idx];
    if (inQuotes) {
      if (byte === 0x22) {
        // Check for escaped quote ("")
        if (idx + 1 < content.length && content[idx + 1] === 0x22) {
          // Skip both quotes and stay in quoted field
          idx += 2;
          continue;
        }
        // Closing quote
        inQuotes = false;
      }
    } else {
      switch (byte) {
        case 0x09: // \t
          return '\t';
        case 0x2c: // ,
          return ',';
        case 0x3b: // ;
          return ';';
        case 0x22: // "
          inQuotes = true;
          break;
      }
    }
    idx += 1;
  }
  return ',';
}

/**
 * Parses separated values following the common RFC 4180 rules: fields may be
 * quoted, quoted fields may contain separators, line breaks, and escaped
 * quotes (`""`), and rows may end with CR, LF, or CRLF. A leading byte order
 * mark is ignored.
 */
export function parseCsv(
  text: string,
  delimiter: CsvSeparator = ',',
): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let started = false;
  let index = text.charCodeAt(0) === 0xfeff ? 1 : 0;

  for (; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      started = true;
      if (char !== '"') {
        field += char;
      } else if (text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = false;
      }
    } else if (char === '"' && field.length === 0) {
      quoted = true;
      started = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
      started = true;
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      started = false;
    } else {
      field += char;
      started = true;
    }
  }

  // A trailing line break must not create an extra empty row, but a row with
  // empty fields (for example `a,` or `""`) is still a row.
  if (started) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
