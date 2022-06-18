#!/usr/bin/env node

import { Command } from "commander";
import check from "./check.js";
import create from "./create.js";
const program = new Command();

check(program);

create(program);

program.parse();
