'use client';
// Minimal client to handle theme, focus mode, and PWA install prompt
import { useEffect } from 'react';

export default function PWAClient(){
  useEffect(() => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

    // Theme/Focus toggles removed from header; keeping minimal PWA install + SW register

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
