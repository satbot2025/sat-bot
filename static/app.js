// SAT Bot minimal client logic + PWA registration
(function(){
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle (persist in localStorage)
  const themeToggle = $('#themeToggle');
  const THEME_KEY = 'satbot.theme';
  const setTheme = (mode) => {
    document.documentElement.dataset.theme = mode;
    try { localStorage.setItem(THEME_KEY, mode); } catch {}
  };
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) setTheme(savedTheme);
  themeToggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  });

  // Focus mode
  $('#focusToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('focus');
  });

  // Simple demo chat that echoes input
  const log = $('#chatLog');
  const form = $('#chatForm');
  const input = $('#chatInput');
  function addMessage(role, text){
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
    log?.scrollTo({top: log.scrollHeight, behavior: 'smooth'});
  }
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input?.value?.trim();
    if (!q) return;
    addMessage('user', q);
    input.value = '';
    setTimeout(() => addMessage('assistant', `You said: ${q}`), 250);
  });

  // PWA: service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }

  // PWA: install prompt
  let deferredPrompt;
  const installBtn = $('#installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn?.removeAttribute('hidden');
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome !== 'dismissed') installBtn.setAttribute('hidden', '');
    deferredPrompt = null;
  });
})();
