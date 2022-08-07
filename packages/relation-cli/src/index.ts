#!/usr/bin/env node

import { Command } from "commander";
import check from "./command/check.js";
import create from "./command/create.js";
import init from "./command/init.js";
import update from "./command/update.js";

const program = new Command();

init(program);

check(program);

create(program);

update(program);

program.parse();
