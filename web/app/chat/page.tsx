'use client';
import { useState } from 'react';

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

const quickPrompts = [
  'Give me a Reading passage with 2 questions',
  'Explain comma rules with examples',
  'A quick math warm-up (3 problems)',
  'How to guess smartly on SAT?',
];

const localFallback = (user: string) => `Here’s a mini Reading task:\n\nPassage: "The city converted empty lots into gardens, boosting local health and morale."\nQ: Which choice best supports the claim that health improved?\nA) The program began in 2018.\nB) Surveys show lower stress scores in participating neighborhoods. ✅\nC) Volunteers painted fences.\nD) The mayor visited twice.\n\nWhy: Only B provides direct evidence (a measurable outcome).`;

export default function ChatPage(){
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hi! I’m your friendly SAT helper. Ask me anything — Reading, Writing, or Math.' }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [model, setModel] = useState<'openai' | 'gemini'>('openai');

  const send = async (prompt?: string) => {
    const text = (prompt ?? input).trim();
    if (!text) return;
    setInput('');
    setBusy(true);
    setNotice(null);
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    try{
      const endpoint = model === 'gemini' ? '/api/chat/gemini' : '/api/chat';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          system: 'You are a concise SAT tutor. Prefer short, clear steps and show the answer with a brief why.',
        })
      });
      if (!res.ok){
        await res.json().catch(() => ({}));
        setNotice('Server unavailable. Showing a local example.');
        setMessages(m => [...m, { role: 'assistant', content: localFallback(text) }]);
      } else {
        const j = await res.json();
        const content = (j?.assistant as string) || localFallback(text);
        setMessages(m => [...m, { role: 'assistant', content }]);
      }
    } catch {
      setNotice('Network issue. Local example below.');
      setMessages(m => [...m, { role: 'assistant', content: localFallback(text) }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: 960 }}>
      <h1 className="h2">Chat with SAT Bot <small style={{ fontSize: '0.6em', opacity: 0.7 }}>model: {model}</small></h1>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, gap:12, flexWrap:'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {quickPrompts.map(q => (
            <button key={q} className="btn" disabled={busy} onClick={() => send(q)}>{q}</button>
          ))}
        </div>
        <InviteFriendButton />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <label style={{ display:'flex', gap:4, alignItems:'center' }}>
          <input type="radio" name="model" value="openai" checked={model==='openai'} onChange={()=>setModel('openai')} /> OpenAI
        </label>
        <label style={{ display:'flex', gap:4, alignItems:'center' }}>
          <input type="radio" name="model" value="gemini" checked={model==='gemini'} onChange={()=>setModel('gemini')} /> Gemini
        </label>
      </div>
      {notice && <p className="muted" role="status">{notice}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => {
          const isAssistant = m.role === 'assistant';
          return (
            <div key={i} style={{ display:'flex', justifyContent: isAssistant ? 'flex-start' : 'flex-end' }}>
              <div
                className="card"
                style={{
                  maxWidth: '75%',
                  background: isAssistant ? 'var(--card)' : 'var(--accent-fade, #dbe8ff)',
                  border: isAssistant ? '1px solid var(--border)' : '1px solid var(--accent, #4d74ff)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  textAlign: 'left'
                }}
              >
                <strong style={{ color: isAssistant ? 'var(--text)' : 'var(--accent-contrast,#062250)' }}>
                  {isAssistant ? 'SAT Bot' : 'You'}
                </strong>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{m.content}</div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={e => { e.preventDefault(); send(); }} className="chat-form" style={{ marginTop: 12, display:'flex', gap:8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="input"
          placeholder="Ask me anything about the SAT..."
          style={{ flex:1 }}
        />
        <button className="btn btn-primary" disabled={busy} type="submit">Send</button>
      </form>
    </section>
  );
}

function InviteFriendButton(){
  const [copied, setCopied] = useState(false);
  const shareText = `Study SAT with me on SAT Bot: ${typeof window !== 'undefined' ? window.location.origin : ''}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(()=>setCopied(false), 2000); } catch {}
  };
  return (
    <div style={{ display:'flex', gap:8 }}>
      <button type="button" className="btn" onClick={copy}>{copied ? 'Link Copied!' : 'Invite Friend'}</button>
      <a className="btn" href="/dashboard#friends">Manage Friends</a>
    </div>
  );
}
