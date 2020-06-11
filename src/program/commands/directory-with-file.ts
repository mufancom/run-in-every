import * as Path from 'path';

import {Context, command, metadata, option} from 'clime';
import glob from 'glob';
import _ from 'lodash';
import * as v from 'villa';

import {Target} from '../@core';

export class DirectoryWithFileOptions extends Target.CommandOptions {
  @option({
    description: 'glob pattern of file to match',
    required: true,
  })
  pattern!: string;
}

@command({
  description: 'Run in every directory with file',
  skippedArgs: true,
})
export default class extends Target.Command {
  @metadata
  execute(options: DirectoryWithFileOptions, context: Context): Promise<void> {
    return this.runInEvery(options, context);
  }

  protected async scan(
    options: DirectoryWithFileOptions,
  ): Promise<Target.Target[]> {
    let filePaths = await v.call(glob, `**/${options.pattern}`, {
      ignore: ['**/node_modules/**'],
    });

    let fileEntries = filePaths.map(path => {
      return {
        path,
        dir: Path.dirname(path),
        variables: {
          fileName: Path.basename(path),
        },
      };
    });

    return _.uniqBy(fileEntries, entry => entry.dir).map(entry => {
      return new Target.Target(entry.dir, entry.dir, entry.variables);
    });
  }
}
