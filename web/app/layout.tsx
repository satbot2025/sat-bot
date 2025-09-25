import './styles.css';
import type { ReactNode } from 'react';
import PWAClient from '@/app/pwa-client';
import { getUserFromCookie } from '@/lib/session';

export const metadata = {
  title: 'SAT Bot — Study Friend',
  description: 'A calm, study-friendly SAT companion. Mobile-first, offline-first.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
  }
};

export const viewport = {
  // Match address bar color to brand (lavender)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#a78bfa' },
    { media: '(prefers-color-scheme: dark)', color: '#a78bfa' },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }){
  const user = await getUserFromCookie();
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="container header-inner">
            <div className="left-spacer" aria-hidden="true" />
            <div className="brand">
              <a className="brand-link" href="/" aria-label="SAT Bot home">
                <img src="/brand/logo.png" alt="SATBOT logo" className="brand-logo" />
              </a>
            </div>
            <nav className="actions" aria-label="Site actions">
              <button id="installBtn" className="btn btn-primary" hidden>Install</button>
              {user ? (
                <>
                  <a className="btn" href="/dashboard">Dashboard</a>
                  <a className="btn" href="/chat">Chat</a>
                  <a className="btn" href="/practice">Practice</a>
                  <form action="/auth/logout" method="post">
                    <button className="btn" type="submit">Logout</button>
                  </form>
                </>
              ) : (
                <>
                  <a className="btn" href="/chat">Chat</a>
                  <a className="btn" href="/auth/login">Login</a>
                  <a className="btn btn-primary" href="/auth/register">Sign up</a>
                </>
              )}
            </nav>
          </div>
        </header>
        <main id="main" className="container">{children}</main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <small>© 2025 sat-bot.com • Powered by Ellie  GJR-701 • BG Design By Cindy•Logo Design By Suizhi</small>
          </div>
        </footer>
        <PWAClient />
      </body>
    </html>
  );
}
