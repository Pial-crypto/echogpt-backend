export interface GenerateResponseInput {
  apiKey: string;
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  baseUrl?: string;
}

export interface GenerateResponseOutput {
  content: string;
  model: string;
  tokensUsed?: number;
}

export interface AIProviderAdapter {
  generate(
    input: GenerateResponseInput,
  ): Promise<GenerateResponseOutput>;
}