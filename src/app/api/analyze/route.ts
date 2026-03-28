import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeRequest {
  image: string | null;
  prompt: string;
}

type ProviderResult =
  | { success: true; text: string }
  | { success: false; error: string };

export async function GET() {
  return NextResponse.json({
    providers: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      claude: Boolean(process.env.ANTHROPIC_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
    },
  });
}

type ProviderCallFn = (key: string, image: string | null, prompt: string) => Promise<ProviderResult>;

interface ProviderConfig {
  name: string;
  key: string | undefined;
  call: ProviderCallFn;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { image, prompt } = body;

    const providers: ProviderConfig[] = [
      { name: 'openai', key: process.env.OPENAI_API_KEY, call: callOpenAI },
      { name: 'claude', key: process.env.ANTHROPIC_API_KEY, call: callClaude },
      { name: 'gemini', key: process.env.GEMINI_API_KEY, call: callGemini },
    ];

    const tried: string[] = [];

    for (const provider of providers) {
      if (!provider.key) continue;
      tried.push(provider.name);
      console.log(`[analyze] Trying provider: ${provider.name}`);
      const result = await provider.call(provider.key, image, prompt);
      if (result.success) {
        return NextResponse.json({ response: result.text });
      }
      console.error(`[analyze] ${provider.name} failed:`, result.error);
    }

    if (tried.length === 0) {
      return NextResponse.json(
        { error: 'No API key configured. Add OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `All providers failed. Tried: ${tried.join(', ')}`, tried },
      { status: 502 }
    );
  } catch (error) {
    console.error('[analyze] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json() as { error?: { message?: string } };
    return data.error?.message ?? 'Unknown error';
  } catch {
    const text = await response.text();
    return text || 'Unknown error';
  }
}

async function callOpenAI(apiKey: string, image: string | null, prompt: string): Promise<ProviderResult> {
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  if (image) {
    content.push({ type: 'image_url', image_url: { url: image } });
  }

  content.push({
    type: 'text',
    text: prompt || 'What do you see in this drawing? Please describe and help me understand it.',
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'You are analyzing a hand-drawn sketch made by gesturing in the air. Be helpful, concise, and insightful. If you see math, solve it. If you see diagrams, explain them.',
        },
        { role: 'user', content },
      ],
    }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    return { success: false, error: `OpenAI error: ${message}` };
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content ?? 'No response generated.';
  return { success: true, text };
}

async function callClaude(apiKey: string, image: string | null, prompt: string): Promise<ProviderResult> {
  const content: Array<{ type: string; source?: { type: string; media_type: string; data: string }; text?: string }> = [];

  if (image) {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: base64Data },
    });
  }

  content.push({
    type: 'text',
    text: prompt || 'What do you see in this drawing? Please describe and help me understand it.',
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'You are analyzing a hand-drawn sketch made by gesturing in the air. Be helpful, concise, and insightful. If you see math, solve it. If you see diagrams, explain them.',
      messages: [{ role: 'user', content }],
    }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    return { success: false, error: `Claude error: ${message}` };
  }

  const data = await response.json() as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text ?? 'No response generated.';
  return { success: true, text };
}

async function callGemini(apiKey: string, image: string | null, prompt: string): Promise<ProviderResult> {
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  if (image) {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    parts.push({ inlineData: { mimeType: 'image/png', data: base64Data } });
  }

  const userMessage = image
    ? `You are analyzing a hand-drawn sketch made by gesturing in the air. Be helpful, concise, and insightful. If you see math, solve it. If you see diagrams, explain them. User's request: ${prompt || 'What do you see?'}`
    : `User's message: ${prompt}`;

  parts.push({ text: userMessage });

  const encodedKey = encodeURIComponent(apiKey);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodedKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
    }
  );

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    return { success: false, error: `Gemini error: ${message}` };
  }

  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response.';
  return { success: true, text };
}
