import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeRequest {
  image: string | null;
  prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { image, prompt } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          response:
            'Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.',
        },
        { status: 200 }
      );
    }

    // Build the parts array for Gemini
    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

    // Add the image if available
    if (image) {
      // Extract base64 data from data URL
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inline_data: {
          mime_type: 'image/png',
          data: base64Data,
        },
      });
    }

    // Add the text prompt
    const systemPrompt = image
      ? `You are a helpful AI assistant analyzing a hand-drawn sketch or diagram. The user drew this in the air using hand tracking technology. Be helpful, concise, and insightful. If you see mathematical equations, help solve or explain them. If you see diagrams, help explain or improve them.

User's question or request: ${prompt || 'What do you see in this drawing? Please describe and help me understand or improve it.'}`
      : `You are a helpful AI assistant. The user is using a gesture-based interface with hand tracking. Be helpful, concise, and insightful.

User's message: ${prompt}`;

    parts.push({ text: systemPrompt });

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        {
          response: `Error from Gemini API: ${errorData.error?.message || 'Unknown error'}`,
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    // Extract the response text
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response.';

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      {
        response: 'An error occurred while processing your request. Please try again.',
      },
      { status: 200 }
    );
  }
}
