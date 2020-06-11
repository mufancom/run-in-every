import Chalk from 'chalk';
import {
  Command as ClimeCommand,
  Context,
  ExpectedError,
  Options as ClimeOptions,
  option,
} from 'clime';
import * as v from 'villa';

import {Target} from './target';

export class CommandOptions extends ClimeOptions {
  @option({
    flag: 'b',
    toggle: true,
    default: false,
    description: 'exit immediately upon failure',
  })
  bail!: boolean;

  @option({
    flag: 'q',
    toggle: true,
    default: false,
    description: 'silence user command output',
  })
  quiet!: boolean;

  @option({
    flag: 'e',
    toggle: true,
    description: 'echo run-in-every output',
  })
  echo!: boolean;

  @option({
    flag: 'p',
    toggle: true,
    description: 'run commands in parallel',
  })
  parallel!: boolean;

  @option({
    default: 5,
    description: 'concurrency for parallel mode',
  })
  concurrency!: number;
}

export abstract class Command extends ClimeCommand {
  protected abstract scan(options: CommandOptions): Promise<Target[]>;

  protected async runInEvery(
    options: CommandOptions,
    context: Context,
  ): Promise<void> {
    let [command, ...args] = context.skippedArgs;

    if (!command) {
      throw new ExpectedError('Missing command');
    }

    let targets = await this.scan(options);

    if (options.echo) {
      console.info(Chalk.blue('[scan]'));
      console.info(`found: ${targets.length}`);
    }

    let bailed = false;

    let results = await v.map(
      targets,
      async target => {
        if (bailed) {
          return undefined;
        }

        let result = await target.execute(command, args, {
          echo: options.echo,
          quiet: options.quiet,
        });

        if (result) {
          return true;
        }

        if (options.bail && !bailed) {
          bailed = true;
        }

        return false;
      },
      options.parallel ? options.concurrency || 1 : 1,
    );

    let executedResults = results.filter(result => typeof result === 'boolean');
    let succeededResults = executedResults.filter(result => result);

    let succeeded = succeededResults.length === results.length;

    if (options.echo) {
      console.info((succeeded ? Chalk.green : Chalk.red)('[result]'));

      if (options.bail) {
        console.info(
          `succeeded/executed/total: ${succeededResults.length}/${executedResults.length}/${results.length}`,
        );
      } else {
        console.info(
          `succeeded/total: ${succeededResults.length}/${results.length}`,
        );
      }
    }

    process.exit(succeeded ? 0 : 1);
  }
}
