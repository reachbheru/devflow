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
    contextPreprocessor,
    objectTree = {}
  ) {
    this.fileUtils = fileUtils;
    this.llmClient = llmClient;
    this.embeddingUtils = embeddingUtils;
    this.queue = queue;
    this.queue.onDone(this.continueGenerateDocs.bind(this));
    this.contextPreprocessor = contextPreprocessor;
    this.chunkUtils = chunkUtils;
    this.objectTree = objectTree;
  }

  async generateDocs(options = {}) {
    console.log("Generating docs...")
    await this.fileUtils.collectFiles(
      "/home/bheru/bizjet-backend",
      this.objectTree,
      options,
      this.queue
    );
  }
  async continueGenerateDocs() {
    console.log("continueGenerateDocs...");
    console.log("objectTree: ",this.objectTree);
    console.log("docsGenerationPrompt: ",docsGenerationPrompt);
    console.log("docsRefinementPrompt: ",docsRefinementPrompt);
    const stitchedResponse = [];
    const embeddedContent = await this.embeddingUtils.loadEmbeddings();
    console.log("loaded embeddings lenght: ",Object.keys(embeddedContent).length);
    const context = await this.embeddingUtils.extractMetadata(embeddedContent);
    console.log("context lenght: ",context.length);
    const context_filemap_array = Object.entries(
      await this.embeddingUtils.groupByFile(context)
    );
    console.log("context_filemap_array lenght: ",context_filemap_array.length);
    for (let i = 0; i < context_filemap_array.length; i++) {
      const text = await this.chunkUtils.flattenChunks(
        context_filemap_array[i]
      );
      console.log("text lenght: ",text.length);
      const batchedContextArray =
        await this.contextPreprocessor.batchingContext(
          text,
          docsGenerationPrompt
        );
        console.log("batchedContextArray lenght: ",batchedContextArray.length);
      for (let j = 0; j < batchedContextArray.length; j++) {
        const response =
          await this.llmClient.generateContentWithSystemInstructions(
            batchedContextArray[j],
            docsGenerationPrompt
          );
          console.log("response lenght: ",response.length);
        stitchedResponse.push(`\n${response}`);
      }
    }
    const refinedPrompt = `The project’s folder structure ${this.objectTree} that shows how files and directories are organized.\n\n${docsRefinementPrompt}`;
    const finalResponse =
      await this.llmClient.generateContentWithSystemInstructions(
        stitchedResponse.join("\n\n"),
        refinedPrompt
      );
    console.log("final Response: ",finalResponse)
    return finalResponse;
  }
}
