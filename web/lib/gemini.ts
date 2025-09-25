import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export function getGeminiModel(){
  if (!API_KEY) throw new Error('Missing GEMINI_API_KEY');
  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({ model: MODEL });
}

export function buildPrompt(system: string | undefined, messages: { role: string; content: string }[], limit = 14){
  const recent = messages.slice(-limit);
  const convo = recent.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  return `${system || ''}\n\n${convo}\n\nASSISTANT:`.trim();
}
