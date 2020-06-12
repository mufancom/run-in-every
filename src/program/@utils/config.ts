import * as FS from 'fs';
import * as Path from 'path';

import stripJSONComments from 'strip-json-comments';
import * as v from 'villa';
import * as YAML from 'yaml';

export type ConfigType = 'javascript' | 'json' | 'yaml';

export async function loadConfig<T = unknown>(
  path: string,
  defaultType?: ConfigType,
): Promise<T>;
export async function loadConfig(
  path: string,
  defaultType?: ConfigType,
): Promise<unknown> {
  let extension = Path.extname(path);

  let type: ConfigType;

  switch (extension) {
    case '.js':
    case '.cjs':
      type = 'javascript';
      break;
    case '.json':
      type = 'json';
      break;
    case '.yaml':
    case '.yml':
      type = 'yaml';
      break;
    default:
      if (!defaultType) {
        throw new Error(
          `No default type provided for unknown extension, file "${path}"`,
        );
      }

      type = defaultType;
      break;
  }

  switch (type) {
    case 'javascript':
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require(Path.resolve(path));
    case 'json': {
      let jsonc = await v.call<string>(FS.readFile, path, 'utf8');
      return JSON.parse(stripJSONComments(jsonc));
    }
    case 'yaml': {
      let yaml = await v.call<string>(FS.readFile, path, 'utf8');
      return YAML.parse(yaml);
    }
  }
}
