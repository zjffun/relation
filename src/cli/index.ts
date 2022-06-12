#!/usr/bin/env node

import { Command } from "commander";
import check from "./check.js";
const program = new Command();

check(program);

program.parse();
