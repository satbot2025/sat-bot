import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/session';

export async function GET(){
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ ok:false, user:null }, { status:401 });
  return NextResponse.json({ ok:true, user: { id: user.id, username: user.username } });
}
