import {NextResponse} from 'next/server';
import {checkPassword,createSession,safeReturn,sessionCookie} from '@/lib/server/auth';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const base=process.env.SITE_ORIGIN;
 if(!base)return new Response('Unavailable',{status:503});
 const site=new URL(base),allowed=new Set([site.origin]);
 if(site.hostname==='karuizawa.art'||site.hostname==='www.karuizawa.art'){
  allowed.add('https://karuizawa.art');allowed.add('https://www.karuizawa.art');
 }
 const origin=request.headers.get('origin');
 if(!origin||!allowed.has(origin))return new Response('Forbidden',{status:403});
 if(Number(request.headers.get('content-length')||0)>4096)return new Response('Too large',{status:413});
 const body=await request.text();if(body.length>4096)return new Response('Too large',{status:413});
 const data=new URLSearchParams(body),email=(data.get('email')||'').trim().toLowerCase(),target=safeReturn(data.get('return_to'));
 // Stay on the trusted request origin so the host-only session cookie follows the redirect.
 if(!checkPassword(email,data.get('password')||''))return NextResponse.redirect(new URL(`/manage/login?error=1&return_to=${encodeURIComponent(target)}`,origin),303);
 const response=NextResponse.redirect(new URL(target,origin),303);
 response.cookies.set(sessionCookie,createSession(email),{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:8*3600});
 response.headers.set('Cache-Control','no-store');return response;
}
