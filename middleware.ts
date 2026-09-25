import { NextResponse, type NextRequest } from 'next/server';
export function middleware(_request:NextRequest){const response=NextResponse.next();response.headers.set('Cache-Control','private, no-store, max-age=0');response.headers.set('X-Robots-Tag','noindex, nofollow, noarchive');response.headers.set('Referrer-Policy','no-referrer');response.headers.set('X-Frame-Options','DENY');response.headers.set('Cross-Origin-Resource-Policy','same-origin');response.headers.set('X-Content-Type-Options','nosniff');return response;}
export const config={matcher:['/manage/:path*','/api/manage/:path*']};
