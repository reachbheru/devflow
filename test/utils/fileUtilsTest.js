import dotenv from "dotenv";
dotenv.config();
import { getFileUtils, getQueue } from "../../src/dependency/service_deps.js";
import os from "os";
import path from "path";
import { cwd } from "process";

const globalDirPath = path.join(os.homedir(), "devflow");

const current_dir = process.cwd();

const fileUtils = getFileUtils();
const queue = getQueue();

const excludeList = ["node_modules", "package.json", "package-lock.json"];
const includeHidden = false;
await fileUtils.collectFiles(
  current_dir,
  { excludeList, includeHidden },
  queue
);

queue.onDone(() => {
  console.log("done");
});
