import {createHmac,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
import {sqlite} from './storage';
export const sessionCookie='kav_admin';
export function allowedEmail(email:string){return (process.env.ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());}
function secret(){const key=process.env.SESSION_SECRET;if(!key||key.length<32)throw new Error('SESSION_SECRET not configured');return key;}
export function createSession(email:string){const payload=Buffer.from(JSON.stringify({email,exp:Date.now()+8*3600_000,nonce:randomBytes(16).toString('hex')})).toString('base64url');return payload+'.'+createHmac('sha256',secret()).update(payload).digest('base64url');}
export async function sessionUser(){const token=(await cookies()).get(sessionCookie)?.value;if(!token)return null;try{const [payload,signature,...extra]=token.split('.');if(extra.length||!signature)return null;const expected=createHmac('sha256',secret()).update(payload).digest();const supplied=Buffer.from(signature,'base64url');if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return null;const {email,exp}=JSON.parse(Buffer.from(payload,'base64url').toString());if(typeof email!=='string'||typeof exp!=='number'||exp<Date.now()||!allowedEmail(email))return null;return {userId:email,email,displayName:email,fullName:null};}catch{return null;}}
export function safeReturn(value:string|null){if(!value||!value.startsWith('/manage')||value.startsWith('/manage/login')||value.includes('\\'))return '/manage/applications';const url=new URL(value,'https://local.invalid');return url.origin==='https://local.invalid'?url.pathname+url.search:'/manage/applications';}
export function checkPassword(email:string,password:string){const db=sqlite(),now=Date.now();const prior=db.prepare("SELECT failures,blocked_until FROM auth_attempts WHERE id='admin'").get() as {failures:number;blocked_until:number}|undefined;if(prior&&prior.blocked_until>now)return false;
 const [salt,hex]=String(process.env.ADMIN_PASSWORD_HASH||'').split(':');let valid=false;
 if(salt&&hex&&password.length<=256){try{const candidate=scryptSync(password,salt,64);const expected=Buffer.from(hex,'hex');valid=expected.length===candidate.length&&timingSafeEqual(expected,candidate)&&allowedEmail(email);}catch{}}
 if(valid){db.prepare("DELETE FROM auth_attempts WHERE id='admin'").run();return true;}
 const failures=(prior&&prior.blocked_until===0?prior.failures:0)+1;db.prepare("INSERT INTO auth_attempts VALUES('admin',?,?) ON CONFLICT(id) DO UPDATE SET failures=excluded.failures,blocked_until=excluded.blocked_until").run(failures,failures>=5?now+15*60_000:0);return false;
}
