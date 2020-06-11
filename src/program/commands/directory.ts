import * as Path from 'path';

import {Context, command, metadata, option} from 'clime';
import glob from 'glob';
import _ from 'lodash';
import * as v from 'villa';

import {Target} from '../@core';

export class DirectoryOptions extends Target.CommandOptions {
  @option({
    description: 'glob pattern of directory name',
    required: true,
  })
  pattern!: string;
}

@command({
  description: 'Run in every directory',
  skippedArgs: true,
})
export default class extends Target.Command {
  @metadata
  execute(options: DirectoryOptions, context: Context): Promise<void> {
    return this.runInEvery(options, context);
  }

  protected async scan(options: DirectoryOptions): Promise<Target.Target[]> {
    let directoryPaths = await v.call(glob, `**/${options.pattern}/`, {
      ignore: ['**/node_modules/**'],
    });

    let directoryEntries = directoryPaths.map(path => {
      return {
        path,
        variables: {
          dirName: Path.basename(path),
        },
      };
    });

    return directoryEntries.map(entry => {
      return new Target.Target(entry.path, entry.path, entry.variables);
    });
  }
}
