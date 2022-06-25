#!/usr/bin/env node

import { Command } from "commander";
import check from "./check.js";
import create from "./create.js";
import init from "./init.js";
import update from "./update.js";

const program = new Command();

init(program);

check(program);

create(program);

update(program);

program.parse();
