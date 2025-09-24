import { redirect } from 'next/navigation';
import { getUserByUsername } from '@/lib/db';
import { setSession, getUserFromCookie } from '@/lib/session';
import bcrypt from 'bcryptjs';

export default async function LoginPage({ searchParams }: { searchParams?: { error?: string }}){
  const existing = await getUserFromCookie();
  if (existing) redirect('/dashboard');

  async function login(formData: FormData){
    'use server';
    const username = (formData.get('username') as string || '').trim().toLowerCase();
    const password = (formData.get('password') as string || '');
    const user = await getUserByUsername(username);
    if (!user) redirect('/auth/login?error=Invalid%20credentials');
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) redirect('/auth/login?error=Invalid%20credentials');
    await setSession(user.id);
    redirect('/dashboard');
  }

  const errorMsg = searchParams?.error;
  return (
    <section className="card">
      <h1 className="h2">Sign in</h1>
      {errorMsg && <p className="error" role="alert">{errorMsg}</p>}
      <form action={login} className="chat-form">
        <input name="username" className="input" placeholder="Username" minLength={3} maxLength={20} required />
        <input name="password" type="password" className="input" placeholder="Password" minLength={6} required />
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
    </section>
  );
}
