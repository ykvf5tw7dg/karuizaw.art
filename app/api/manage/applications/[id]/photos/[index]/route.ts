import { adminUser,adminJson,privateHeaders } from '@/lib/admin';
import { getApplication,storedPhotos } from '@/db/admin-applications';
import { applicationBucket } from '@/db/applications';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string;index:string}>}){
 if(!await adminUser())return adminJson({error:'需要管理员登录。'},401);
 const {id,index}=await params;if(!/^\d+$/.test(index))return adminJson({error:'未找到图片。'},404);
 try{const row=await getApplication(id);const photo=row?storedPhotos(row)[Number(index)]:null;if(!photo)return adminJson({error:'未找到图片。'},404);
 const object=await applicationBucket().get(photo.key);if(!object)return adminJson({error:'未找到图片。'},404);
 return new Response(object.body,{headers:{...privateHeaders,'Content-Type':photo.contentType,'Content-Disposition':'inline','Content-Security-Policy':"default-src 'none'; sandbox"}});
 }catch{return adminJson({error:'暂时无法读取图片，请稍后重试。'},503);}
}
