export class FileProcessorQueue {
  constructor(chunkUtils, embeddingUtils, fileUtils, maxWorkers = 5) {
    this.chunkUtils = chunkUtils;
    this.embeddingUtils = embeddingUtils;
    this.fileUtils = fileUtils;
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
      console.warn(`Failed ${filePath}, retrying…`, err.message);
      this.queue.push(filePath); // simple retry
    }

    this.activeWorkers--;
    this.run(); // try next
  }

  async processFile(filePath) {
    const file_content = await this.fileUtils.readFile(filePath);
    const file_chunks = await this.chunkUtils.getSemanticChunks(file_content);
    const file_embeddings = await this.embeddingUtils.generateEmbeddings(
      file_chunks
    );
    await this.embeddingUtils.persistEmbeddings(
      filePath,
      file_chunks,
      file_embeddings
    );
  }

  onDone(callback) {
    this.doneCallback = callback;
  }
}
