import { getDocsGenerator } from "../dependency/service_deps.js";

async function docs(options = {}) {
  const docsGenerator = getDocsGenerator();
  const docsGenerated = await docsGenerator.generateDocs(options);
  console.log("generated docs", docsGenerated);
}

export { docs };
