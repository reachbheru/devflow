import fs from "fs/promises";
import path from "path";
import lockfile from "proper-lockfile";

export class FileUtils {
  constructor(logger, custom_error, validator) {
    this.logger = logger;
    this.custom_error = custom_error;
    this.validator = validator;
  }

  // Create folder
  async createFolderIfNotExists(dirPath) {
    if (!dirPath) throw new this.custom_error("directory path not given");
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return true;
    } catch (error) {
      throw new this.custom_error("failed to create folder", [error.message]);
    }
  }

  // Create file
  async createFileIfNotExists(filePath) {
    if (!filePath) throw new this.custom_error("file path not given");
    try {
      await fs.access(filePath);
      this.logger.warn("file already exists");
      return false;
    } catch {
      await fs.writeFile(filePath, "", "utf-8");
      return true;
    }
  }

  // Write JSON
  async writeJson(filePath, data, options = {}) {
    if (!filePath) throw new this.custom_error("file path not provided");
    if (!data) throw new this.custom_error("json data not provided");
    if (!this.validator.jsonValidator(data))
      throw new this.custom_error("invalid json data");

    let release;
    try {
      release = await lockfile.lock(filePath, {
        retries: {
          retries: 3, // Number of retries
          minTimeout: 200, // Wait 200ms before first retry
          factor: 2, // Double the wait time each retry
        },
      });

      if (!options.force) {
        try {
          const stats = await fs.stat(filePath);
          if (stats.length > 0) {
            throw new this.custom_error(
              "file already has content \nUse --force true to overwrite"
            );
          }
        } catch (error) {
          if (error.code !== "ENOENT") {
            throw new this.custom_error("failed to check file", [
              error.message,
            ]);
          }
        }
      }
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (error) {
      throw new this.custom_error("failed to write json", [error.message]);
    } finally {
      if (release) {
        await release();
      }
    }
  }

  // Read JSON
  async readJson(filePath) {
    if (!filePath) throw new this.custom_error("file path not provided");
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      if (!fileData || fileData.length === 0) return {};
      return JSON.parse(fileData);
    } catch (error) {
      throw new this.custom_error("failed to read json", [error.message]);
    }
  }

  // Collect files into a tree
  async collectFiles(dirPath, options = {}, queue) {
    if (!dirPath) throw new this.custom_error("directory path not provided");
    try {
      const fileTreeObject = {};
      await this.generateFileTree(dirPath, fileTreeObject, options, queue);
      return fileTreeObject;
    } catch (error) {
      throw new this.custom_error("failed to collect files", [error.message]);
    }
  }

  // Path type
  async itIsFileOrFolder(targetPath) {
    if (!targetPath) throw new this.custom_error("path not provided");
    try {
      const stat = await fs.stat(targetPath);
      if (stat.isFile()) return "File";
      if (stat.isDirectory()) return "Folder";
      return false;
    } catch (error) {
      if (error.code === "ENOENT")
        throw new this.custom_error("path not found.");
      throw new this.custom_error("failed to check file/folder", [
        error.message,
      ]);
    }
  }

  // Build tree recursively
  async generateFileTree(dirPath, fileTreeObject, options = {}, queue) {
    const type = await this.itIsFileOrFolder(dirPath);

    if (type === "File") {
      const fileName = path.basename(dirPath);
      const ext = path.extname(fileName);
      if (!options.includeHidden && fileName.startsWith(".")) return;
      if (options.excludeList?.some((excluded) => dirPath.includes(excluded)))
        return;
      if (options.fileExtensions && !options.fileExtensions.includes(ext))
        return;
      fileTreeObject[fileName] = true;

      if (queue && !(await this.isFileEmpty(dirPath))) {
        queue.enqueue(dirPath);
      }

      return;
    }

    if (type === "Folder") {
      const folderName = path.basename(dirPath);
      if (!options.includeHidden && folderName.startsWith(".")) return;
      if (options.excludeList?.some((excluded) => dirPath.includes(excluded)))
        return;
      const folderContent = await this.readFolder(dirPath);
      fileTreeObject[folderName] = {};
      for (const file of folderContent) {
        const filePath = path.join(dirPath, file);
        await this.generateFileTree(
          filePath,
          fileTreeObject[folderName],
          options,
          queue
        );
      }
    }
  }

  // Check if file is empty or not
  async isFileEmpty(filePath) {
    try {
      const stat = await fs.stat(filePath);
      return stat.size === 0;
    } catch (error) {
      if (error.code === "ENOENT") return true;
      throw new this.custom_error("failed to check file", [error.message]);
    }
  }

  // Read file
  async readFile(filePath) {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      throw new this.custom_error("failed to read file", [error.message]);
    }
  }

  // Write file
  async writeFile(filePath, data) {
    try {
      await fs.writeFile(filePath, data, "utf-8");
      return true;
    } catch (error) {
      throw new this.custom_error("failed to write file", [error.message]);
    }
  }

  // Read folder
  async readFolder(dirPath) {
    try {
      return await fs.readdir(dirPath);
    } catch (error) {
      throw new this.custom_error("failed to read folder", [error.message]);
    }
  }
}
