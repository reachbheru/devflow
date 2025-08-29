import { Validator } from "../modules/utils/validator.js";
import { FileUtils } from "../modules/utils/fileUtils.js";
import { Logger } from "../modules/utils/logger.js";
import { CustomError } from "../modules/utils/customError.js";
import { FileProcessorQueue } from "../modules/utils/processorQueue.js";


function getFileUtils() {
  return new FileUtils(getLogger(), getCustomError(), getValidator());
}

function getValidator() {
  return new Validator();
}

function getLogger() {
  return new Logger();
}

function getCustomError() {
  return CustomError;
}

function getQueue() {
  return new FileProcessorQueue();
}

export { getCustomError, getFileUtils, getLogger, getQueue, getValidator };
