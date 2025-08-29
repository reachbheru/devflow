import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function getSemanticChunks(text) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 900,      // 900 characters per chunk
    chunkOverlap: 150,   // 150 characters overlap
    separators: ["\n\n", "\n", " ", ""],  // try to split at natural boundaries
    lengthFunction: (text) => text.length, // use character length instead of tokens
  });

  const chunks = await textSplitter.splitText(text);
  return chunks;
}
