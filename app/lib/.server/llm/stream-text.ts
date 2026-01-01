import { streamText as _streamText, convertToModelMessages } from 'ai';
import { getAPIKey, getGoogleAPIKey } from '~/lib/.server/llm/api-key';
import { getAnthropicModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { GoogleGenAI } from '@google/genai';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export type AIProvider = 'anthropic' | 'google';

interface Env {
  ANTHROPIC_API_KEY?: string;
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
}

export async function streamText(
  messages: Messages,
  env: Env,
  provider: AIProvider = 'anthropic',
  options?: StreamingOptions
) {
  if (provider === 'google') {
    // server-side Google GenAI SDK implementation
    const apiKey = getGoogleAPIKey(env);
    const ai = new GoogleGenAI({ apiKey });

    // convert messages to Google format
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // use streaming API - returns AsyncGenerator directly

    // model: 'gemini-2.5-flash',

    const googleResult = await ai.models.generateContentStream({
      model: 'gemini-flash-lite-latest',
      contents,
      config: {
        maxOutputTokens: MAX_TOKENS,
        systemInstruction: getSystemPrompt(),
      },
    });

    let fullText = '';

    // create AI SDK compatible stream
    return {
      toDataStreamResponse: () => {
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
          async start(controller) {
            try {
              // iterate over the AsyncGenerator directly
              for await (const chunk of googleResult) {
                const text = chunk.text;

                if (text) {
                  fullText += text;
                  controller.enqueue(
                    encoder.encode(
                      `0:"${text.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`
                    )
                  );
                }
              }

              // close the stream naturally - client will detect completion
              controller.close();

              // trigger onFinish callback if provided
              if (options?.onFinish) {
                await options.onFinish({
                  text: fullText,
                  finishReason: 'stop',
                  usage: {
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0,
                  },
                } as any);
              }
            } catch (error) {
              console.error('Google streaming error:', error);
              controller.error(error);
            }
          },
        });

        return new Response(stream);
      },
    };
  }

  // use Anthropic with AI SDK
  const model = getAnthropicModel(getAPIKey(env) || '');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { prompt, ...restOptions } = options || {};

  const result = await _streamText({
    model,
    system: getSystemPrompt(),
    messages: await convertToModelMessages(messages as any),
    ...restOptions,
  });

  return {
    toDataStreamResponse: () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
          }
          controller.close();
        },
      });

      return new Response(stream);
    },
  };
}
