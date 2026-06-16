// import { getEmbeddingUtils } from "../../src/dependency/service_deps.js";
// import { getFileUtils } from "../../src/dependency/service_deps.js";

// const fileUtils = getFileUtils();
// const embeddingUtils = getEmbeddingUtils();

// const embeddedContent = await fileUtils.readJson("embedding.json");

// const data = await embeddingUtils.extractMetadata(embeddedContent);
// const context_array = Object.entries(await embeddingUtils.groupByFile(data));
// console.log("this is context array : ",context_array[12]);

import { docsGenerator } from "../../src/modules/services/docsGenerator.js";

const docsGeneratorInstance = new docsGenerator();
docsGeneratorInstance.generateDocs();

