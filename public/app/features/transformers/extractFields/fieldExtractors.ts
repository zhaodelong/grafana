import { Registry, RegistryItem } from '@grafana/data';

export enum FieldExtractorID {
  JSON = 'json',
  KeyValues = 'kvp',
  Auto = 'auto',
}

export interface FieldExtractor extends RegistryItem {
  parse: (v: string) => Record<string, any> | undefined;
}

const extJSON: FieldExtractor = {
  id: FieldExtractorID.JSON,
  name: 'JSON',
  description: 'Parse JSON string',
  parse: (v: string) => {
    return JSON.parse(v);
  },
};

const extLabels: FieldExtractor = {
  id: FieldExtractorID.KeyValues,
  name: 'Key+value pairs',
  description: 'Look for a=b, c: d values in the line',
  parse: parseKeyValuePairs,
};

export function parseKeyValuePairs(raw: string): Record<string, string> {
  const buff: string[] = []; // array of characters
  let esc = '';
  let key = '';
  const obj: Record<string, string> = {};
  for (let i = 0; i < raw.length; i++) {
    let c = raw[i];
    if (c === esc) {
      esc = '';
      c = raw[++i];
    }

    const isEscaped = c === '\\';
    if (isEscaped) {
      c = raw[++i];
    }

    // When escaped just append
    if (isEscaped || esc.length) {
      buff.push(c);
      continue;
    }

    if (c === `"` || c === `'`) {
      esc = c;
    }

    switch (c) {
      case ':':
      case '=':
        if (buff.length) {
          key = buff.join('');
          buff.length = 0; // clear values
        }
        break;

      // escape chars
      case `"`:
      case `'`:
      // whitespace
      case ` `:
      case `\n`:
      case `\t`:
      case `\r`:
      case `\n`:
      // seperators
      case ',':
      case ';':
      case '&':
      case '{':
      case '}':
        if (buff.length) {
          const val = buff.join('');
          if (key.length) {
            obj[key] = val;
            key = '';
          } else {
            key = val;
          }
          buff.length = 0; // clear values
        }
        break;

      // append our buffer
      default:
        buff.push(c);
    }
  }

  if (key.length) {
    obj[key] = buff.join('');
  }
  return obj;
}

const fmts = [extJSON, extLabels];

const extAuto: FieldExtractor = {
  id: FieldExtractorID.Auto,
  name: 'Auto',
  description: 'parse new fields automatically',
  parse: (v: string) => {
    for (const f of fmts) {
      try {
        const r = f.parse(v);
        if (r != null) {
          return r;
        }
      } catch {} // ignore errors
    }
    return undefined;
  },
};

export const fieldExtractors = new Registry<FieldExtractor>(() => [...fmts, extAuto]);
