import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Validator } from "../modules/utils/validator.js";
import { FileUtils } from "../modules/utils/fileUtils.js";
import { Logger } from "../modules/utils/logger.js";
import { CustomError } from "../modules/utils/customError.js";
import { FileProcessorQueue } from "../modules/utils/processorQueue.js";
import { chunkUtils } from "../modules/utils/chunkUtils.js";
import { embeddingUtils } from "../modules/utils/embeddingUtils.js";
import { llmClient } from "../modules/llm/llmClient.js";
import { contextPreprocessor } from "../modules/services/contextPreprocessor.js";
import { docsGenerator } from "../modules/services/docsGenerator.js";

dotenv.config();

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
  return new FileProcessorQueue(
    getChunkUtils(),
    getEmbeddingUtils(),
    getFileUtils()
  );
}

function getGoogleAi() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function getChunkUtils() {
  return new chunkUtils();
}

function getEmbeddingUtils() {
  return new embeddingUtils(getllmClient(), getFileUtils());
}

function getllmClient() {
  return new llmClient(getGoogleAi(), getCustomError());
}

function getContextPreprocessor() {
  return new contextPreprocessor(getChunkUtils(), getCustomError());
}

function getDocsGenerator() {
  return new docsGenerator(
    getFileUtils(),
    getChunkUtils(),
    getllmClient(),
    getEmbeddingUtils(),
    getQueue(),
    getContextPreprocessor()
  );
}

export {
  getCustomError,
  getFileUtils,
  getLogger,
  getQueue,
  getValidator,
  getGoogleAi,
  getChunkUtils,
  getEmbeddingUtils,
  getllmClient,
  getContextPreprocessor,
  getDocsGenerator,
};
