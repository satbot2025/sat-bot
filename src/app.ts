// TypeScript version of client logic + PWA registration
const $ = <T extends Element = Element>(s: string, el: Document | Element = document) => el.querySelector<T>(s) as T | null;

// Year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

// Theme toggle (persist in localStorage)
const themeToggle = $('#themeToggle');
const THEME_KEY = 'satbot.theme';
const setTheme = (mode: 'light' | 'dark') => {
  document.documentElement.dataset.theme = mode;
  try { localStorage.setItem(THEME_KEY, mode); } catch {}
};
const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
if (savedTheme) setTheme(savedTheme);

themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(next as 'light' | 'dark');
});

// Focus mode
$('#focusToggle')?.addEventListener('click', () => {
  document.body.classList.toggle('focus');
});

// Simple demo chat that echoes input
const log = $('#chatLog');
const form = $('#chatForm') as HTMLFormElement | null;
const input = $('#chatInput') as HTMLInputElement | null;
function addMessage(role: 'user' | 'assistant', text: string){
  const el = document.createElement('div');
  el.className = 'message';
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? '🧑' : '🤖';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  el.appendChild(avatar); el.appendChild(bubble);
  log?.appendChild(el);
  (log as HTMLElement | null)?.scrollTo({top: (log as HTMLElement).scrollHeight, behavior: 'smooth'});
}
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = input?.value?.trim();
  if (!q) return;
  addMessage('user', q);
  if (input) input.value = '';
  setTimeout(() => addMessage('assistant', `You said: ${q}`), 250);
});

// PWA: service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

// PWA: install prompt
let deferredPrompt: any;
const installBtn = $('#installBtn') as HTMLButtonElement | null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn?.removeAttribute('hidden');
});
installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome !== 'dismissed') installBtn?.setAttribute('hidden', '');
  deferredPrompt = null;
});
