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

  const send = async (prompt?: string) => {
    const text = (prompt ?? input).trim();
    if (!text) return;
    setInput('');
    setBusy(true);
    setNotice(null);
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    try{
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          system: 'You are a concise SAT tutor. Prefer short, clear steps and show the answer with a brief why.',
        })
      });
      if (!res.ok){
        await res.json().catch(() => ({}));
        setNotice('Oops, the server didn’t respond. Showing a local example instead.');
        setMessages(m => [...m, { role: 'assistant', content: localFallback(text) }]);
      } else {
        const j = await res.json();
        const content = (j?.assistant as string) || localFallback(text);
        setMessages(m => [...m, { role: 'assistant', content }]);
      }
    } catch {
      setNotice('Oops, the server didn’t respond. Showing a local example instead.');
      setMessages(m => [...m, { role: 'assistant', content: localFallback(text) }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: 960 }}>
      <h1 className="h2">Chat with SAT Bot</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {quickPrompts.map(q => (
          <button key={q} className="btn" disabled={busy} onClick={() => send(q)}>{q}</button>
        ))}
      </div>
      {notice && <p className="muted" role="status">{notice}</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} className="card" style={{ background: m.role === 'assistant' ? 'var(--card)' : 'transparent' }}>
            <strong>{m.role === 'assistant' ? 'SAT Bot' : 'You'}</strong>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{m.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={e => { e.preventDefault(); send(); }} className="chat-form" style={{ marginTop: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="input"
          placeholder="Ask me anything about the SAT..."
        />
        <button className="btn btn-primary" disabled={busy} type="submit">Send</button>
      </form>
    </section>
  );
}
