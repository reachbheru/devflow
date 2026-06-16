#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config({path:".env"});

import { Command } from "commander";
import { init } from "../src/commands/init.js";
import { docs } from "../src/commands/docs.js";

const program = new Command();

program
  .name("devflow")
  .description("CLI for Devflow project")
  .version("1.0.0");

// Init command
program
  .command("init")
  .description("Initialize Devflow project")
  .action(async () => {
    await init();
  });


// Docs command with options
program
  .command("docs")
  .description("Generate project documentation")
  .option("--includeHidden", "Include hidden files in the documentation")
  .option("--excludeList <items>", "Comma-separated list of file or folder names to exclude", (val) => val.split(","))
  .action(async (options) => {
    console.log("Generating project documentation...");
    await docs(options);
    console.log("Documentation generated successfully!");
  });

program.parse(process.argv);