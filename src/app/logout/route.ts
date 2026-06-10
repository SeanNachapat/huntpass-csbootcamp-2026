import { clearSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await clearSession();
  return NextResponse.redirect(new URL('/', request.url));
}
