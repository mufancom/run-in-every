#!/usr/bin/env node

import * as Path from 'path';

import 'villa/platform/node';

import {CLI, Shim} from 'clime';

let cli = new CLI('run-in-every', Path.join(__dirname, 'commands'));

let shim = new Shim(cli);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
shim.execute(process.argv);
