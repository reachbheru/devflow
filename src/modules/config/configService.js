import fs from "fs";
import os from "os";
import path from "path";

const globalDirPath = path.join(os.homedir(), "devflow");
const globalFilePath = path.join(os.homedir(), "devflow", "config.json");

let tempGlobalConfigData;

export class ConfigService {
  saveGlobalConfig(data) {
    console.log(data);
    if (!fs.existsSync(globalDirPath)) {
      fs.mkdirSync(globalDirPath);
    }

    //did not check if file is exist or not because everytime new global config will be made
    try {
      tempGlobalConfigData = data;
      fs.writeFileSync(globalFilePath, JSON.stringify(data), { flag: "w" });
    } catch (error) {
      console.error("error while writing global config: ", error.message);
    }
  }

  readGlobalConfig() {
    if (!fs.existsSync(globalDirPath) || !fs.existsSync(globalFilePath)) {
      console.log("global config is not there first try devflow --init");
      return;
    }
    try {
      const data = fs.readFileSync(globalFilePath, "utf-8");
      const parsedData = JSON.parse(data);
      console.log("parsed data: ", parsedData);
      return parsedData;
    } catch (error) {
      console.error(
        "error while reading or parsing global config: ",
        error.message
      );
      if (tempGlobalConfigData) {
        const config_service = new ConfigService();
        config_service.saveGlobalConfig(tempGlobalConfigData);
        config_service.readGlobalConfig();
      }
    }
  }
}
