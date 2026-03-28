import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Helper to build a NextRequest-like object for POST
function buildPostRequest(body: unknown): Request {
  return new Request('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/analyze', () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  it('should return health check showing which keys are configured without exposing values', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_API_KEY', '');

    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('providers');
    expect(body.providers.openai).toBe(false);
    expect(body.providers.claude).toBe(true);
    expect(body.providers.gemini).toBe(false);
    // Must not expose actual key value
    expect(JSON.stringify(body)).not.toContain('test-key');
  });
});

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return 503 when no API keys are configured', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');

    const { POST } = await import('./route');
    const response = await POST(buildPostRequest({ image: null, prompt: 'hello' }) as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBeDefined();
    expect(body.error).toContain('No API key');
  });

  it('should return 502 with tried providers listed when all providers fail', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'fake-openai');
    vi.stubEnv('ANTHROPIC_API_KEY', 'fake-claude');
    vi.stubEnv('GEMINI_API_KEY', '');

    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
        json: async () => ({ error: { message: 'Invalid API key' } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

    const { POST } = await import('./route');
    const response = await POST(buildPostRequest({ image: null, prompt: 'hello' }) as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBeDefined();
    expect(body.tried).toBeInstanceOf(Array);
    expect(body.tried).toContain('openai');
    expect(body.tried).toContain('claude');
  });

  it('should handle non-JSON error responses from providers without crashing', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'fake-openai');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error (plain text)',
      json: async () => { throw new SyntaxError('Unexpected token'); },
    });

    const { POST } = await import('./route');
    const response = await POST(buildPostRequest({ image: null, prompt: 'hello' }) as Parameters<typeof POST>[0]);

    // Should not crash — must return a structured error response
    expect([502, 503, 500].includes(response.status)).toBe(true);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should return 200 with response text on successful provider call', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', 'fake-gemini');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'I see a cat.' }] } }],
      }),
    });

    const { POST } = await import('./route');
    const response = await POST(buildPostRequest({ image: null, prompt: 'what do you see?' }) as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.response).toBe('I see a cat.');
  });
});
