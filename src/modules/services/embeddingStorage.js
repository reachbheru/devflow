import { getFileUtils } from "../../dependency/service_deps.js";
import path from "path";
import fs from "fs";
import { CustomError } from "../utils/customError.js";


const fileUtils = getFileUtils();
const storageFile = path.join(process.cwd(), "embedding.json");

async function initStorage() {
  if (!fs.existsSync(storageFile)) {
    await fileUtils.createFileIfNotExists(storageFile);
    await fileUtils.writeJson(storageFile, {});
  }
}

export async function saveEmbeddings(path, chunks, embeddings) {
  await initStorage();
  const existingData = await fileUtils.readJson(storageFile);
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
  await fileUtils.writeJson(storageFile, data, { force: true });
}

export async function getEmbeddings() {
  initStorage();
  return await fileUtils.readJson(storageFile);
}
