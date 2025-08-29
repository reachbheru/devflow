export class contextPreprocessor {
  constructor(chunkUtils, custom_error) {
    this.chunkUtils = chunkUtils;
    this.custom_error = custom_error;
  }

  async batchingContext(context, prompt) {
    const promptChunkLength = await this.chunkUtils.getTextLength(prompt);
    const contextChunkLength = await this.chunkUtilsgetTextLength(context);
    const maxBatchSize = 32000;
    const buffer = 500;
    if (maxBatchSize >= promptChunkLength + contextChunkLength + buffer) {
      return [...context];
    } else {
      let result = [];
      let start = 0;
      while (start < context.length) {
        let end = start + 1;
        // Expand end until the slice is too big or reaches the end
        while (
          end <= context.length &&
          (await this.chunkUtils.getSliceLength(context.slice(start, end))) <=
            maxBatchSize
        ) {
          end++;
        }
        // Add the valid slice
        const chunk = context.slice(start, end - 1);
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
}
