import _ from 'lodash';
import {Minimatch} from 'minimatch';
import JSONParser from 'state-based-json-parser';

const jsonParser = new JSONParser();

export type DataPatternMatcher = (data: unknown) => boolean;

export function createDataPatternMatcher(pattern: string): DataPatternMatcher {
  type Filter = (data: unknown) => boolean;

  pattern = pattern.trim();

  let filters: Filter[] = [];

  let index = 0;

  while (true) {
    let keys: string[];

    if (index < pattern.length && /["\[]/.test(pattern[index])) {
      let {value, index: lastIndex} = jsonParser.parse(pattern, index);

      if (typeof value === 'string') {
        keys = [value];
      } else if (Array.isArray(value)) {
        keys = value.map(key => _.toString(key));
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

    if (index < pattern.length) {
      let colonRegex = /\s*:\s*/g;

      colonRegex.lastIndex = index;

      let colonGroups = colonRegex.exec(pattern);

      if (colonGroups) {
        index = colonRegex.lastIndex;

        let valueBeingPattern = false;

        if (pattern.slice(index).startsWith('p"')) {
          valueBeingPattern = true;
          index++;
        }

        let {value, index: lastIndex} = jsonParser.parse(pattern, index);

        if (value === undefined) {
          throw new SyntaxError('Invalid data pattern value');
        }

        if (valueBeingPattern && typeof value === 'string') {
          value = new Minimatch(value);
        }

        expectedValue = value;
        index = lastIndex;
      }
    }

    filters.push(createFilter(keys, expectedValue));

    if (index === pattern.length) {
      break;
    }

    let separatorRegex = /\s*,\s*/g;

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
      : value instanceof Minimatch
      ? data => value.match(_.toString(_.get(data, keys)))
      : data => _.isEqual(_.get(data, keys), value);
  }
}
