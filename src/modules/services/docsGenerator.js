import {
  docsGenerationPrompt,
  docsRefinementPrompt,
} from "../prompts/index.js";

export class docsGenerator {
  constructor(
    fileUtils,
    chunkUtils,
    llmClient,
    embeddingUtils,
    queue,
    contextPreprocessor
  ) {
    this.fileUtils = fileUtils;
    this.llmClient = llmClient;
    this.embeddingUtils = embeddingUtils;
    this.queue = queue;
    this.queue.onDone(this.continueGenerateDocs.bind(this));
    this.contextPreprocessor = contextPreprocessor;
    this.chunkUtils = chunkUtils;
  }

  async generateDocs(options = {}) {
    console.log("[DocsGenerator] generateDocs called with options:", options);
    console.log("document generation prompt:", docsGenerationPrompt);
    console.log("document refinement prompt:", docsRefinementPrompt);
    this.objectTree = await this.fileUtils.collectFiles(
      process.cwd(),
      options,
      this.queue
    );
  }
  async continueGenerateDocs() {
    const stitchedResponse = [];
    const embeddedContent = await this.embeddingUtils.loadEmbeddings();
    const context = await this.embeddingUtils.extractMetadata(embeddedContent);
    const context_filemap_array = Object.entries(
      await this.embeddingUtils.groupByFile(context)
    );
    for (let i = 0; i < context_filemap_array.length; i++) {
      const text = await this.chunkUtils.flattenChunks(
        context_filemap_array[i]
      );
      const batchedContextArray =
        await this.contextPreprocessor.batchingContext(
          text,
          docsGenerationPrompt
        );
      for (let j = 0; j < batchedContextArray.length; j++) {
        const response =
          await this.llmClient.generateContentWithSystemInstructions(
            batchedContextArray[j],
            docsGenerationPrompt
          );
        stitchedResponse.push(`\n${response}`);
      }
    }
    const refinedPrompt = `The project’s folder structure ${this.objectTree} that shows how files and directories are organized.\n\n${docsRefinementPrompt}`;
    const finalResponse =
      await this.llmClient.generateContentWithSystemInstructions(
        stitchedResponse.join("\n\n"),
        refinedPrompt
      );
    return finalResponse;
  }
}
