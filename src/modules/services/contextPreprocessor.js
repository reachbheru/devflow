export class contextPreprocessor {
  constructor(chunkUtils, custom_error) {
    this.chunkUtils = chunkUtils;
    this.custom_error = custom_error;
  }

  async batchingContext(contextText, prompt) {
    if (typeof contextText !== "string") {
      throw new this.custom_error("contextText must be a string");
    }

    const promptChunkLength = await this.chunkUtils.getTextLength(prompt);
    const contextChunkLength = await this.chunkUtils.getTextLength(contextText);
    const maxBatchSize = 32000;
    const buffer = 500;
    if (maxBatchSize >= promptChunkLength + contextChunkLength + buffer) {
      return [contextText];
    }
    let result = [];
    let start = 0;
    while (start < contextText.length) {
      let end = start + 1;
      // Expand end until the slice is too big or reaches the end
      while (
        end <= contextText.length &&
        (await this.chunkUtils.getSliceLength(contextText.slice(start, end))) <=
          maxBatchSize
      ) {
        end++;
      }
      // Add the valid slice
      const chunk = contextText.slice(start, end - 1);
      if (chunk.length === 0) {
        // Single item is too large, handle error or skip
        throw new this.custom_error(
          "Single context chunk exceeds max batch size."
        );
      }
      // Recursively batch this chunk if needed
      const batched = await this.batchingContext(chunk, prompt);
      result = result.concat(batched);
      start = end - 1;
    }
    return result;
  }
}
