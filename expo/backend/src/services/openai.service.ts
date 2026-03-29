import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiService = {
  /**
   * Envoie un message au chat IA
   */
  async sendMessage(params: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }) {
    const { messages, model = 'gpt-3.5-turbo', max_tokens = 300, temperature = 0.7 } = params;

    const completion = await openai.chat.completions.create({
      model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      max_tokens,
      temperature,
    });

    const response = completion.choices[0].message.content || '';

    return {
      message: response,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    };
  },
};

