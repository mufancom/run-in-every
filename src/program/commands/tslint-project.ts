import * as Path from 'path';

import {Context, command, metadata} from 'clime';
import glob from 'glob';
import _ from 'lodash';
import * as v from 'villa';

import {Target} from '../@core';

export class TSLintProjectOptions extends Target.CommandOptions {}

@command({
  description: 'Run in every TSLint project',
  skippedArgs: true,
})
export default class extends Target.Command {
  @metadata
  execute(options: TSLintProjectOptions, context: Context): Promise<void> {
    return this.runInEvery(options, context);
  }

  protected async scan(): Promise<Target.Target[]> {
    let configFilePaths = await v.call(glob, '**/tslint.json', {
      ignore: ['**/node_modules/**'],
      nodir: true,
    });

    let configFileEntries = configFilePaths.map(path => {
      return {
        path,
        dir: Path.dirname(path),
        variables: {
          configFileName: Path.basename(path),
        },
      };
    });

    return configFileEntries.map(entry => {
      return new Target.Target(entry.dir, entry.dir, entry.variables);
    });
  }
}
