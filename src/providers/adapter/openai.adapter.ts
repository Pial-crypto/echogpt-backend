import {
  AIProviderAdapter,
  GenerateResponseInput,
  GenerateResponseOutput,
} from './ai-provider.interface.js';

export class OpenAIAdapter
  implements AIProviderAdapter
{
  async generate(
    input: GenerateResponseInput,
  ): Promise<GenerateResponseOutput> {
    const response = await fetch(
      `${input.baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${input.apiKey}`,
        },
        body: JSON.stringify({
          model: input.model,
          messages: input.messages,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `OpenAI API error: ${error}`,
      );
    }

    const data = await response.json();

    return {
      content:
        data.choices?.[0]?.message?.content ?? '',
      model: data.model ?? input.model,
      tokensUsed:
        data.usage?.total_tokens,
    };
  }
}