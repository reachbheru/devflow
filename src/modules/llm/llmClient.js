export class llmClient {
  constructor(ai, custom_error) {
    this.ai = ai;
    this.custom_error = custom_error;
  }
  async generateContentWithSystemInstructions(content, prompt) {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
        config: {
          systemInstruction: prompt,
        },
      });

      return response.text;
    } catch (error) {
      throw new this.custom_error("failed to generate content", [
        error.message,
      ]);
    }
  }
  async generateEmbeddings(chunks) {
    const embeddings = [];
    const batchSize = 100;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      try {
        const result = await this.ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: batch,
        });

        embeddings.push(...result.embeddings);
      } catch (error) {
        throw new this.custom_error(`failed to embed batch starting at ${i}s`, [
          error.message,
        ]);
      }
    }
    return embeddings;
  }
}
