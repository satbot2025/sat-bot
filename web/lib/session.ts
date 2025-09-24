import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { getUserById } from './db';

const key = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret-change-me');
const cookieName = 'sb_session';

export async function setSession(userId: number){
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
  const secure = process.env.NODE_ENV === 'production';
  (await cookies()).set({ name: cookieName, value: token, httpOnly: true, secure, sameSite: 'lax', path: '/' });
}

export async function clearSession(){
  (await cookies()).set({ name: cookieName, value: '', httpOnly: true, expires: new Date(0), path: '/' });
}

export async function getUserFromCookie(){
  const c = (await cookies()).get(cookieName)?.value;
  if (!c) return null;
  try{
    const { payload } = await jwtVerify(c, key);
    const uid = (payload as any).uid as number;
    if (!uid) return null;
    const user = await getUserById(uid);
    return user || null;
  } catch { return null; }
}
