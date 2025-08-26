import fs from "fs";

export class FileUtils {
  constructor(logger, custom_error, validator) {
    this.logger = logger;
    this.custom_error = custom_error;
    this.validator = validator;
  }

  createFolderIfNotExists(dirPath) {
    if (!dirPath) {
      throw new this.custom_error("directory path not given");
    }

    try {
      if (fs.existsSync(dirPath)) {
        this.logger.warn("folder already exists");
        return false;
      }
      fs.mkdirSync(dirPath);
      return true;
    } catch (error) {
      throw new this.custom_error(
        "something went wrong while creating folder.",
        [error.message]
      );
    }
  }

  //TODO: Add a lock based write protection
  writeJson(filePath, data, options = {}) {
    if (!filePath) {
      throw new this.custom_error("file path not provided");
    }
    if (!data) {
      throw new this.custom_error("json data is not provided");
    }
    if (this.validator.jsonValidator(data) === false) {
      throw new this.custom_error("invalid json data");
    }
    if (fs.existsSync(filePath)) {

      try {
        const fileData = fs.readFileSync(filePath, "utf-8");
        if (fileData.length !== 0 && !options.force) {
          throw new this.custom_error(
            "file already have content \nYou can use --force true if want to overwrite"
          );
          fs.accessSync(filePath, fs.constants.w_ok);
        }
      } catch (error) {
        throw new this.custom_error("Error while preparing to write: ",error.message);
      }
    }
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), {
        encoding: "utf-8",
        flag: "w",
      });
      return true;
    } catch (error) {
      throw new this.custom_error("something went wrong while writing json.", [
        error.message,
      ]);
    }
  }
}
