import * as Path from 'path';

import {Context, command, metadata, option} from 'clime';
import glob from 'glob';
import _ from 'lodash';
import * as v from 'villa';

import {Target} from '../@core';
import {
  DataPatternMatcher,
  createDataPatternMatcher,
  loadSerializedFile,
} from '../@utils';

export class DirectoryWithFileOptions extends Target.CommandOptions {
  @option({
    description: 'glob pattern of file to match',
    required: true,
  })
  pattern!: string;

  @option({
    description: 'data pattern of file to match',
    default: '',
  })
  data!: string;

  get dataPatternMatcher(): DataPatternMatcher | undefined {
    let dataPattern = this.data;

    if (!dataPattern) {
      return undefined;
    }

    return createDataPatternMatcher(dataPattern);
  }
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
      nodir: true,
      dot: true,
    });

    let dataPatternMatcher = options.dataPatternMatcher;

    if (dataPatternMatcher) {
      filePaths = await v.filter(filePaths, async path => {
        let data = await loadSerializedFile<any>(path);

        return dataPatternMatcher!(data);
      });
    }

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
