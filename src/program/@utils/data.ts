import _ from 'lodash';
import JSONParser from 'state-based-json-parser';

const jsonParser = new JSONParser();

export type DataPatternMatcher = (data: unknown) => boolean;

export function createDataPatternMatcher(pattern: string): DataPatternMatcher {
  type Filter = (data: unknown) => boolean;

  let filters: Filter[] = [];

  let index = 0;

  while (true) {
    let keys: string[];

    if (index < pattern.length && /["\[]/.test(pattern[index])) {
      let {value, index: lastIndex} = jsonParser.parse(pattern, index);

      if (typeof value === 'string') {
        keys = [value];
      } else if (Array.isArray(value)) {
        keys = value.map(key => String(key));
      } else {
        throw new SyntaxError('Invalid data pattern path');
      }

      index = lastIndex;
    } else {
      let path = pattern.slice(index).split(/[:,]/, 1)[0];

      keys = path.split('.');
      index = index + path.length;
    }

    let expectedValue: unknown;

    if (index < pattern.length && pattern[index] === ':') {
      index++;

      let {value, index: lastIndex} = jsonParser.parse(pattern, index);

      if (value === undefined) {
        throw new SyntaxError('Invalid data pattern value');
      }

      expectedValue = value;
      index = lastIndex;
    }

    filters.push(createFilter(keys, expectedValue));

    if (index === pattern.length) {
      break;
    }

    let separatorRegex = /,\s*/g;

    separatorRegex.lastIndex = index;

    let separatorGroups = separatorRegex.exec(pattern);

    if (separatorGroups) {
      index = separatorRegex.lastIndex;
      continue;
    }

    throw new SyntaxError('Expecting pattern separator');
  }

  return data => {
    for (let filter of filters) {
      if (!filter(data)) {
        return false;
      }
    }

    return true;
  };

  function createFilter(keys: string[], value: unknown): Filter {
    return value === undefined
      ? data => _.has(data, keys)
      : data => _.isEqual(_.get(data, keys), value);
  }
}
