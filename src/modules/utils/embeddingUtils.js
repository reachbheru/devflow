import path from "path";
import fs from "fs";

const storageFile = path.join(process.cwd(), "embedding.json");

export class embeddingUtils {
  constructor(ai, fileUtils) {
    this.ai = ai;
    this.fileUtils = fileUtils;
  }

  async extractMetadata(embededContent) {
    const documents = [];
    const embededObject = Object.entries(embededContent);
    for (let i = 0; i < embededObject.length; i++) {
      const metadata = embededObject[i][1].metadata;
      const value = {
        filePath: metadata.filePath,
        chunkIndex: metadata.chunkIndex,
        content: metadata.content,
      };
      documents.push(value);
    }
    return documents;
  }

  async groupByFile(context) {
    const fileMap = {};
    for (let i = 0; i < context.length; i++) {
      if (!fileMap[context[i].filePath]) {
        fileMap[context[i].filePath] = [];
      }
      fileMap[context[i].filePath].push({
        chunkIndex: context[i].chunkIndex,
        content: context[i].content,
      });
    }
    console.log(fileMap);
    return fileMap;
  }

  async generateEmbeddings(chunks) {
    const embeddings = [];
    const batchSize = 100;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      // Correct usage: call genAI.models.embedContent
      const result = await this.ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: batch,
      });

      embeddings.push(...result.embeddings);
    }
    return embeddings;
  }

  async ensureStorage() {
    if (!fs.existsSync(storageFile)) {
      await this.fileUtils.createFileIfNotExists(storageFile);
      await this.fileUtils.writeJson(storageFile, {});
    }
  }

  async persistEmbeddings(path, chunks, embeddings) {
    await this.ensureStorage();
    const existingData = await this.fileUtils.readJson(storageFile);
    const data = { ...existingData };
    for (let i = 0; i < chunks.length; i++) {
      const key = `${path}-${i}`;
      data[key] = {
        embedding: embeddings[i],
        metadata: {
          filePath: path,
          chunkIndex: i,
          content: chunks[i],
          timeStamp: new Date().toISOString(),
        },
      };
    }
    await this.fileUtils.writeJson(storageFile, data, { force: true });
  }

  async loadEmbeddings() {
    await this.ensureStorage();
    return await this.fileUtils.readJson(storageFile);
  }
}
