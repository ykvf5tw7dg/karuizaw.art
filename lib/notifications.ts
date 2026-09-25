import { env } from 'cloudflare:workers';
import { applicationDb } from '@/db/applications';
import { kindNames,displayDate,type ApplicationRow } from '@/db/admin-applications';
export function mailReady(){try{return new URL(env.MAIL_RELAY_URL??'').protocol==='https:'&&!!env.MAIL_RELAY_TOKEN&&!!env.NOTIFY_TO&&new URL(env.SITE_ORIGIN??'').protocol==='https:';}catch{return false;}}
export async function notifyApplication(id:string){
 if(!mailReady())return false;
 const db=applicationDb();const now=new Date().toISOString();
 const claimed=await db.prepare("UPDATE application_notifications SET status='sending',lock_until=? WHERE application_id=? AND (status='pending' OR (status='sending' AND lock_until < ?)) RETURNING application_id").bind(new Date(Date.now()+60000).toISOString(),id,now).first();
 if(!claimed)return false;
 try{
  const row=await db.prepare('SELECT id,type,name,email,payload,created_at,status FROM applications WHERE id=?').bind(id).first<ApplicationRow>();if(!row)throw new Error('missing_application');
  const link=new URL(`/manage/applications/${encodeURIComponent(id)}`,env.SITE_ORIGIN).href;
  const response=await fetch(env.MAIL_RELAY_URL!,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.MAIL_RELAY_TOKEN}`,'Idempotency-Key':`application-${id}`},signal:AbortSignal.timeout(12000),body:JSON.stringify({messageId:`application-${id}`,to:env.NOTIFY_TO,subject:`【轻井泽国际艺术村】收到${kindNames[row.type]??'新申请'} · ${row.name.replace(/[\r\n]/g,' ').slice(0,60)}`,text:`你收到了一份新的${kindNames[row.type]??'申请'}。\n\n联系人：${row.name}\n提交时间（日本时间）：${displayDate(row.created_at)}\n申请编号：KAV-${id}\n\n查看申请与图片：\n${link}\n\n请使用获授权的管理员 ChatGPT 账号登录。此链接不授予查看权限，转发后他人仍需通过身份验证。\n\n轻井泽国际艺术中心（筹）`})});
  if(!response.ok)throw new Error('relay_rejected');
  const receipt=await response.json() as {accepted?:boolean};if(receipt.accepted!==true)throw new Error('relay_unconfirmed');
  await db.prepare("UPDATE application_notifications SET status='sent',sent_at=?,lock_until=NULL,last_error=NULL WHERE application_id=?").bind(new Date().toISOString(),id).run();return true;
 }catch{
  await db.prepare("UPDATE application_notifications SET status='pending',lock_until=NULL,last_error='邮件未获确认，可安全重试' WHERE application_id=?").bind(id).run();return false;
 }
}
