import { type NextRequest } from 'next/server';
import { streamText } from '~/lib/.server/llm';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const { message } = (await request.json()) as { message: string };

  const env = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  };

  try {
    const result = await streamText(
      [
        {
          role: 'user',
          content: `[Model: You are a professional prompt engineer. Your task is to enhance prompts for an AI coding assistant. The original prompt is: "${message}". Please rewrite it to be more specific, structured, and effective for code generation. Keep the core intent but make it clearer and more actionable.]`,
        },
      ],
      env as any
    );

    const stream = result.toDataStreamResponse().body;

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in prompt enhancer:', error);

    return new Response('Error enhancing prompt', {
      status: 500,
    });
  }
}
