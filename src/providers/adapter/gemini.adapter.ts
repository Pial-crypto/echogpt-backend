import {
  AIProviderAdapter,
  GenerateResponseInput,
  GenerateResponseOutput,
} from './ai-provider.interface.js';

export class GeminiAdapter
  implements AIProviderAdapter
{
  async generate(
    input: GenerateResponseInput,
  ): Promise<GenerateResponseOutput> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${input.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: input.messages
            .filter(
              (message) =>
                message.role !== 'system',
            )
            .map((message) => ({
              role:
                message.role === 'assistant'
                  ? 'model'
                  : 'user',
              parts: [
                {
                  text: message.content,
                },
              ],
            })),
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Gemini API error: ${error}`,
      );
    }

    const data = await response.json();

    return {
      content:
        data.candidates?.[0]?.content
          ?.parts?.[0]?.text ?? '',
      model: input.model,
    };
  }
}