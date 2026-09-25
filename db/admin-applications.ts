import { applicationDb } from './applications';
export type ApplicationRow={id:string;type:string;name:string;email:string;payload:string;created_at:string;status:string};
export type StoredPhoto={key:string;category:string;name:string;size:number;contentType:string};
export const kindNames:Record<string,string>={artist:'艺术家申请',sponsor:'赞助合作申请',space:'空间加入申请'};
export function displayDate(value:string){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));}
export function parsePayload(row:ApplicationRow){try{return JSON.parse(row.payload) as Record<string,unknown>;}catch{return {};}}
export function storedPhotos(row:ApplicationRow):StoredPhoto[]{const photos=parsePayload(row).photos;return Array.isArray(photos)?photos.filter(p=>p&&typeof p.key==='string'&&p.key.startsWith(`applications/${row.id}/`)&&['image/jpeg','image/png','image/webp'].includes(p.contentType)):[];}
export async function getApplication(id:string){if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id))return null;return applicationDb().prepare('SELECT id,type,name,email,payload,created_at,status FROM applications WHERE id=?').bind(id).first<ApplicationRow>();}
