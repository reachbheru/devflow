import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export class chunkUtils {
  async flattenChunks([filePath, chunks]) {
    const text = chunks.map((c) => c.content).join("\n");
    return text;
  }

  async getSemanticChunks(text) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 900, // 900 characters per chunk
      chunkOverlap: 150, // 150 characters overlap
      separators: ["\n\n", "\n", " ", ""], // try to split at natural boundaries
      lengthFunction: (text) => text.length, // use character length instead of tokens
    });

    const chunks = await textSplitter.splitText(text);
    return chunks;
  }

  async getTextLength(text) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 900,
      chunkOverlap: 0,
      separators: ["\n\n", "\n", " ", ""],
      lengthFunction: (text) => text.length, // counts characters
    });

    const chunks = await textSplitter.splitText(text);
    // sum up lengths of all chunks
    return chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  }

  async getSliceLength(slice) {
    if (!Array.isArray(slice)) {
      throw new Error("Input to getSliceLength must be an array of strings.");
    }
    return slice.reduce((sum, text) => sum + text.length, 0);
  }
}
