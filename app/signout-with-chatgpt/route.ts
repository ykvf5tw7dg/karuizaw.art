import {NextResponse} from 'next/server';
import {sessionCookie} from '@/lib/server/auth';
export async function GET(){const response=NextResponse.redirect(new URL('/',process.env.SITE_ORIGIN||'https://karuizawa.art'));response.cookies.set(sessionCookie,'',{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:0});response.headers.set('Cache-Control','no-store');return response;}
