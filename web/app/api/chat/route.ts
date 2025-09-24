import { NextRequest, NextResponse } from 'next/server';

// Minimal server-side proxy to OpenAI. Never expose your key to the browser.
export async function POST(req: NextRequest){
  try{
    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const system = typeof body?.system === 'string' ? body.system : undefined;

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        error: 'missing_api_key',
        assistant: null,
      }, { status: 503 });
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          system ? { role: 'system', content: system } : undefined,
          ...messages,
        ].filter(Boolean),
        temperature: 0.4,
      }),
    });

    if (!resp.ok){
      const err = await resp.text().catch(() => '');
      return NextResponse.json({ ok: false, error: 'upstream_error', detail: err || resp.statusText }, { status: 502 });
    }
    const data = await resp.json();
    const assistant = data?.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ ok: true, assistant });
  } catch (e: any){
    return NextResponse.json({ ok: false, error: 'server_error', detail: e?.message || String(e) }, { status: 500 });
  }
}
