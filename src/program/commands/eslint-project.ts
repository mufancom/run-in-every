import * as FS from 'fs';
import * as Path from 'path';

import {Context, command, metadata} from 'clime';
import glob from 'glob';
import _ from 'lodash';
import * as v from 'villa';

import {Target} from '../@core';

const ESLINT_CONFIG_FILE_NAMES = [
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.yaml',
  '.eslintrc.yml',
  '.eslintrc.json',
  '.eslintrc',
];

const ESLINT_CONFIG_FILE_GLOB_PATTERN = `**/{${ESLINT_CONFIG_FILE_NAMES.join(
  ',',
)}}`;

export class ESLintProjectOptions extends Target.CommandOptions {}

@command({
  description: 'Run in every ESLint project',
  skippedArgs: true,
})
export default class extends Target.Command {
  @metadata
  execute(options: ESLintProjectOptions, context: Context): Promise<void> {
    return this.runInEvery(options, context);
  }

  protected async scan(): Promise<Target.Target[]> {
    let eslintConfigFilePaths = await v.call(
      glob,
      ESLINT_CONFIG_FILE_GLOB_PATTERN,
      {
        ignore: ['**/node_modules/**'],
        nodir: true,
      },
    );

    let packageFilePaths = await v.call(glob, '**/package.json', {
      ignore: ['**/node_modules/**'],
      nodir: true,
    });

    let configFileEntries = [
      ...eslintConfigFilePaths,
      ...(await v.filter(packageFilePaths, async path => {
        let json = await v.call<string>(FS.readFile, path, 'utf8');
        return 'eslintConfig' in JSON.parse(json);
      })),
    ].map(path => {
      return {
        path,
        dir: Path.dirname(path),
        variables: {
          configFileName: Path.basename(path),
        },
      };
    });

    return _.uniqBy(configFileEntries, entry => entry.dir).map(entry => {
      return new Target.Target(entry.dir, entry.dir, entry.variables);
    });
  }
}
