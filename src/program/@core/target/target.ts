import * as ChildProcess from 'child_process';

import Chalk from 'chalk';
import NPMWhich from 'npm-which';
import * as ShellQuote from 'shell-quote';
import {Dict} from 'tslang';
import * as v from 'villa';

export interface TargetExecuteOptions {
  quiet: boolean;
  echo: boolean;
}

export interface TargetOptions {
  cwd: string;
}

export class Target {
  constructor(
    readonly id: string,
    readonly cwd: string,
    readonly variableDict: Dict<string>,
  ) {}

  async execute(
    command: string,
    args: string[],
    {quiet, echo}: TargetExecuteOptions,
  ): Promise<boolean> {
    args = args.map(arg =>
      arg.replace(
        /\\([{}])|\{(\w[\w\d]*)\}/g,
        (_text, escapedChar, variableName) => {
          if (escapedChar) {
            return escapedChar;
          }

          return this.variableDict[variableName] ?? '';
        },
      ),
    );

    if (echo) {
      console.info(Chalk.blue(`[target:${this.id}]`));
      console.info(`command: ${ShellQuote.quote([command, ...args])}`);
    }

    let executable = NPMWhich(this.cwd).sync(command);

    let cp = ChildProcess.spawn(executable, args, {
      cwd: this.cwd,
    });

    if (!quiet) {
      cp.stdout.pipe(process.stdout);
      cp.stderr.pipe(process.stderr);
    }

    return v.awaitable(cp, 'exit', code => {
      if (echo) {
        console.info(
          (code === 0 ? Chalk.green : Chalk.red)(`[target:${this.id}]`),
        );
        console.info(`exit-code: ${code}`);
      }

      return code === 0;
    });
  }
}
