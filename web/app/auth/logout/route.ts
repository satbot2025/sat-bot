import { clearSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(){
  await clearSession();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
