import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, buildPrompt } from '@/lib/gemini';

export async function POST(req: NextRequest){
  try{
    if (!process.env.GEMINI_API_KEY){
      return NextResponse.json({ ok:false, error:'missing_api_key' }, { status:503 });
    }
    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const system = typeof body?.system === 'string' ? body.system : 'You are a concise SAT tutor.';

    // Basic length guard
    if (messages.length > 40) messages.splice(0, messages.length - 40);

    const model = getGeminiModel();
    const prompt = buildPrompt(system, messages);

    const result = await model.generateContent(prompt);
    const text = result.response.text() || '';
    return NextResponse.json({ ok:true, assistant: text });
  } catch(e:any){
    return NextResponse.json({ ok:false, error:'server_error', detail: e?.message || String(e) }, { status:500 });
  }
}
