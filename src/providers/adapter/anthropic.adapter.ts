import {
  AIProviderAdapter,
  GenerateResponseInput,
  GenerateResponseOutput,
} from './ai-provider.interface.js';

export class AnthropicAdapter
  implements AIProviderAdapter
{
  async generate(
    input: GenerateResponseInput,
  ): Promise<GenerateResponseOutput> {
    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': input.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: input.model,
          max_tokens: 4096,
          messages: input.messages
            .filter(
              (message) =>
                message.role !== 'system',
            )
            .map((message) => ({
              role:
                message.role === 'assistant'
                  ? 'assistant'
                  : 'user',
              content: message.content,
            })),
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Anthropic API error: ${error}`,
      );
    }

    const data = await response.json();

    return {
      content:
        data.content?.[0]?.text ?? '',
      model:
        data.model ?? input.model,
      tokensUsed:
        (data.usage?.input_tokens ?? 0) +
        (data.usage?.output_tokens ?? 0),
    };
  }
}