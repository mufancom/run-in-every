import * as Path from 'path';

import _ from 'lodash';

export function filterNestedPaths<T>(
  entries: T[],
  pathGetter: (entry: T) => string,
  sorted = false,
): T[] {
  if (!sorted) {
    entries = _.sortBy(entries, entry => pathGetter(entry));
  }

  let filteredEntries: T[] = [];

  let pendingEntry: T | undefined;

  for (let entry of entries) {
    if (!pendingEntry) {
      pendingEntry = entry;
      continue;
    }

    if (
      Path.relative(pathGetter(pendingEntry), pathGetter(entry)).startsWith(
        '..',
      )
    ) {
      // `entry` is not within `pendingEntry`, but as we already sorted the
      // entries, `entry` not the upper entry of `pendingEntry` either.

      filteredEntries.push(pendingEntry);
      pendingEntry = entry;
    }
  }

  if (pendingEntry) {
    filteredEntries.push(pendingEntry);
  }

  return filteredEntries;
}
