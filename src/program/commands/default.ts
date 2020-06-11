import {SubcommandDefinition} from 'clime';

export const subcommands: SubcommandDefinition[] = [
  {
    name: 'eslint-project',
    aliases: ['eslint'],
    brief: 'ESLint projects',
  },
  {
    name: 'tslint-project',
    aliases: ['tslint'],
    brief: 'TSLint projects',
  },
  {
    name: 'ts-project',
    aliases: ['ts'],
    brief: 'TypeScript projects',
  },
  {
    name: 'directory',
    brief: 'Directory',
  },
  {
    name: 'directory-with-file',
    brief: 'Directory with file',
  },
];
