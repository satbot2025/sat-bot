'use client';
// Minimal client to handle theme, focus mode, and PWA install prompt
import { useEffect } from 'react';

export default function PWAClient(){
  useEffect(() => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

    const THEME_KEY = 'satbot.theme';
    const setTheme = (mode: 'light' | 'dark') => {
      document.documentElement.dataset.theme = mode;
      try { localStorage.setItem(THEME_KEY, mode); } catch {}
    };
    const saved = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    if (saved) setTheme(saved);

    const themeBtn = document.getElementById('themeToggle');
    const focusBtn = document.getElementById('focusToggle');

    themeBtn?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      setTheme(next as 'light' | 'dark');
    });
    focusBtn?.addEventListener('click', () => {
      document.body.classList.toggle('focus');
    });

    let deferredPrompt: any;
    const installBtn = document.getElementById('installBtn');
    window.addEventListener('beforeinstallprompt', (e: any) => {
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

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  }, []);

  return null;
}
