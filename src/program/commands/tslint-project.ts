import * as Path from 'path';

import {Context, command, metadata, option} from 'clime';
import glob from 'glob';
import _ from 'lodash';
import * as v from 'villa';

import {Target} from '../@core';
import {filterNestedPaths} from '../@utils';

const TSLINT_CONFIG_FILE_NAMES = ['tslint.json', 'tslint.yaml'];

const TSLINT_CONFIG_FILE_GLOB_PATTERN = `**/{${TSLINT_CONFIG_FILE_NAMES.join(
  ',',
)}}`;

export class TSLintProjectOptions extends Target.CommandOptions {
  @option({
    toggle: true,
    description: 'include nested-projects',
  })
  nested!: boolean;
}

@command({
  description: 'Run in every TSLint project',
  skippedArgs: true,
})
export default class extends Target.Command {
  @metadata
  execute(options: TSLintProjectOptions, context: Context): Promise<void> {
    return this.runInEvery(options, context);
  }

  protected async scan(
    options: TSLintProjectOptions,
  ): Promise<Target.Target[]> {
    let configFilePaths = await v.call(glob, TSLINT_CONFIG_FILE_GLOB_PATTERN, {
      ignore: ['**/node_modules/**'],
      nodir: true,
      dot: true,
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

    configFileEntries = _.sortBy(
      _.uniqBy(configFileEntries, entry => entry.dir),
      entry => entry.dir,
    );

    if (!options.nested) {
      configFileEntries = filterNestedPaths(
        configFileEntries,
        entry => {
          return {
            path: entry.dir,
            forceKeep: false,
          };
        },
        true,
      );
    }

    return configFileEntries.map(entry => {
      return new Target.Target(entry.dir, entry.dir, entry.variables);
    });
  }
}
