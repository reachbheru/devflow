#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
import { init } from "../src/commands/init.js";

if (process.argv[2] === "--init") {
  init();
} else {
  console.log("please enter valid option");
}
