[![NPM Package](https://badge.fury.io/js/run-in-every.svg)](https://www.npmjs.com/package/run-in-every)
[![Build Status](https://travis-ci.org/makeflow/run-in-every.svg?branch=master)](https://travis-ci.org/makeflow/run-in-every)

# Run in Every

A simple command line utility for running commands in specific projects or directories.

## Installation

```
yarn add --dev run-in-every
```

## Usage

```
run-in-every [target-name] [...options] -- command [...args]
```

For example:

```
run-in-every eslint-project -- eslint . --ext .js,.ts
```

### Common Options

- `--bail` (`-b`) exit immediately upon failure.
- `--quiet` (`-q`) silence user command output.
- `--echo` (`-e`) echo run-in-every output.
- `--parallel` (`-p`) run commands in parallel.
  - `--concurrency <number>` concurrency for parallel mode.

## Supported Targets

### ESLint Project

Target name `eslint-project`, alias `eslint`.

#### variables

- `configFileName` file name of the matched config file (`Path.basename()`).

### TSLint Project

Target name `tslint-project`, alias `tslint`.

#### variables

- `configFileName` file name of the matched config file (`Path.basename()`).

### TypeScript Project

Target name `ts-project`, alias `ts`.

#### options

- `--composite-only` match only composite projects (`extends` is not handled).

#### variables

- `configFileName` file name of the matched config file (`Path.basename()`).

### Directory

Target name `directory`.

#### options

- `--pattern <string>` glob pattern of directory name.

#### variables

- `dirName` directory name of the matched directory (`Path.basename()`).

### Directory with File

Target name `directory-with-file`.

#### options

- `--pattern <string>` glob pattern of file to match.

#### variables

- `fileName` file name of the matched file (`Path.basename()`).

# License

MIT License.
