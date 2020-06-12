import * as Path from 'path';

import _ from 'lodash';

export function filterNestedPaths<T>(
  entries: T[],
  callback: (entry: T) => {path: string; forceKeep: boolean},
  sorted = false,
): T[] {
  if (!sorted) {
    entries = _.sortBy(entries, entry => callback(entry));
  }

  let filteredEntries: T[] = [];

  let pendingEntries: T[] = [];

  for (let entry of entries) {
    let lastPendingEntry = _.last(pendingEntries);

    if (!lastPendingEntry) {
      pendingEntries.push(entry);
      continue;
    }

    let {path: pendingEntryPath} = callback(lastPendingEntry);
    let {path: entryPath, forceKeep: toForceKeep} = callback(entry);

    if (toForceKeep) {
      pendingEntries.push(entry);
      continue;
    }

    if (Path.relative(pendingEntryPath, entryPath).startsWith('..')) {
      // `entry` is not within `pendingEntry`, but as we already sorted the
      // entries, `entry` not the upper entry of `pendingEntry` either.

      filteredEntries.push(pendingEntries.pop()!);
      pendingEntries.push(entry);
    }
  }

  if (pendingEntries) {
    filteredEntries.push(...pendingEntries);
  }

  return filteredEntries;
}
