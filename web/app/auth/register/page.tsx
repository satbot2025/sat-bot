import { redirect } from 'next/navigation';
import { createUser, getUserByUsername } from '@/lib/db';
import { setSession, getUserFromCookie } from '@/lib/session';
import bcrypt from 'bcryptjs';

export default async function RegisterPage({ searchParams }: { searchParams?: { error?: string }}){
  const existing = await getUserFromCookie();
  if (existing) redirect('/dashboard');

  async function register(formData: FormData){
    'use server';
    const username = (formData.get('username') as string || '').trim().toLowerCase();
    const password = (formData.get('password') as string || '');
    const zipcode = ((formData.get('zipcode') as string) || '').trim();
    if (!/^[a-z0-9]{3,20}$/.test(username)) redirect('/auth/register?error=Username%20must%20be%203-20%20letters%2Fnumbers.');
    if (password.length < 6) redirect('/auth/register?error=Password%20must%20be%20at%20least%206%20characters.');
  if (!/^\d{5}(-\d{4})?$/.test(zipcode)) redirect('/auth/register?error=Invalid%20ZIP%20code.');

    // Server-side ZIP lookup using Zippopotam.us (no key needed)
    let school_city: string | undefined;
    let school_state: string | undefined;
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zipcode.slice(0,5))}`, { cache: 'no-store' });
  if (!res.ok) redirect('/auth/register?error=Invalid%20ZIP%20code.');
      const data: any = await res.json();
      const place = Array.isArray(data.places) && data.places[0];
      if (place) {
        school_city = (place['place name'] as string | undefined) || undefined;
        school_state = ((place['state abbreviation'] as string) || (place['state'] as string) || undefined);
      }
      if (!school_city || !school_state) redirect('/auth/register?error=Invalid%20ZIP%20code.');
    } catch {
      redirect('/auth/register?error=Invalid%20ZIP%20code.');
    }
    const taken = await getUserByUsername(username);
    if (taken) redirect('/auth/register?error=That%20username%20is%20taken.');
    const hash = await bcrypt.hash(password, 10);
    try{
      await createUser(username, hash, zipcode || undefined, school_city, school_state);
    } catch (e) {
      console.error('createUser failed', e);
      redirect('/auth/register?error=Sign%20up%20failed.%20Please%20try%20again.');
    }
    const user = await getUserByUsername(username);
    if (!user) redirect('/auth/register?error=Could%20not%20create%20account.');
    await setSession(user.id);
    redirect('/dashboard');
  }

  const errorMsg = searchParams?.error;
  return (
    <section className="card">
      <h1 className="h2">Create your account</h1>
      {errorMsg && <p className="error" role="alert" aria-live="polite">{errorMsg}</p>}
      <form action={register} className="chat-form">
        <input name="username" className="input" placeholder="Username (letters/numbers)" minLength={3} maxLength={20} required />
        <input name="password" type="password" className="input" placeholder="Password (min 6)" minLength={6} required />
        <input
          name="zipcode"
          className="input"
          placeholder="Your school ZIP code"
          inputMode="numeric"
          pattern="^[0-9]{5}(?:-[0-9]{4})?$"
          title="Enter a valid US ZIP (e.g., 10001 or 10001-0001)."
          required
        />
        <button className="btn btn-primary" type="submit">Create account</button>
      </form>
    </section>
  );
}
