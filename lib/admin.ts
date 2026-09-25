import { env } from 'cloudflare:workers';
import { getChatGPTUser, requireChatGPTUser } from '@/app/chatgpt-auth';
export function allowedAdmin(email:string){return (env.ADMIN_EMAILS??'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean).includes(email.trim().toLowerCase());}
export async function adminUser(){const user=await getChatGPTUser();return user&&allowedAdmin(user.email)?user:null;}
export async function requireAdmin(returnTo:string){const user=await requireChatGPTUser(returnTo);return allowedAdmin(user.email)?user:null;}
export const privateHeaders={'Cache-Control':'private, no-store, max-age=0','X-Robots-Tag':'noindex, nofollow, noarchive','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Cross-Origin-Resource-Policy':'same-origin'};
export function adminJson(data:unknown,status=200){return Response.json(data,{status,headers:privateHeaders});}
