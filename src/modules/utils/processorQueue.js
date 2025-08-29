import { getSemanticChunks } from "./chunkUtils.js";
import { embedChunks } from "../services/embeddingService.js";
import { getFileUtils } from "../../dependency/service_deps.js";
import { saveEmbeddings } from "../services/embeddingStorage.js";

export class FileProcessorQueue {
  constructor(maxWorkers = 5) {
    this.queue = [];
    this.maxWorkers = maxWorkers;
    this.activeWorkers = 0;
    this.doneCallback = null;
  }

  enqueue(filePath) {
    this.queue.push(filePath);
    this.run(); // try to process immediately
  }

  async run() {
    if (this.activeWorkers >= this.maxWorkers) return;
    if (this.queue.length === 0) {
      if (this.activeWorkers === 0 && this.doneCallback) {
        this.doneCallback();
      }
      return;
    }

    const filePath = this.queue.shift();
    this.activeWorkers++;

    try {
      await this.processFile(filePath);
    } catch (err) {
      console.warn(`Failed ${filePath}, retrying…`,err.message);
      this.queue.push(filePath); // simple retry
    }

    this.activeWorkers--;
    this.run(); // try next
  }

  async processFile(filePath) {
    const fileUtils = getFileUtils();
    const file_content = await fileUtils.readFile(filePath);
    const file_chunks = await getSemanticChunks(file_content);
    const file_embeddings = await embedChunks(file_chunks);
    console.log(file_embeddings);
    await saveEmbeddings(filePath, file_chunks, file_embeddings);
  }

  onDone(callback) {
    this.doneCallback = callback;
  }
}
