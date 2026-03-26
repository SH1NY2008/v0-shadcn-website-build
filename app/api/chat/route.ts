import { Ollama } from 'ollama';
import { NextRequest, NextResponse } from 'next/server';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const stream = await ollama.chat({
      model: 'llama2',
      messages: messages,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(new TextEncoder().encode(chunk.message.content));
        }
        controller.close();
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
