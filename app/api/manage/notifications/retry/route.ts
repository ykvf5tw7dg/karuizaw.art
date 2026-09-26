import { adminUser,adminJson } from '@/lib/admin';
import { applicationDb } from '@/db/applications';
import { mailReady,notifyApplication } from '@/lib/notifications';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(process.env.SITE_ORIGIN||request.url).origin)return adminJson({error:'请从申请管理页面操作。'},403);
 if(!await adminUser())return adminJson({error:'需要管理员登录。'},401);
 if(!mailReady())return adminJson({error:'发信服务尚未配置。'},503);
 try{const rows=await applicationDb().prepare("SELECT application_id FROM application_notifications WHERE status='pending' OR (status='sending' AND lock_until < ?) ORDER BY created_at LIMIT 5").bind(new Date().toISOString()).all<{application_id:string}>();let sent=0;for(const row of rows.results){if(await notifyApplication(row.application_id))sent++;}return adminJson({sent});}catch{return adminJson({error:'暂时无法发送通知。'},503);}
}
