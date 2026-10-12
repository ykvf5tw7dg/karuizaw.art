import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {adminUser,privateHeaders} from '@/lib/admin';
import {getProfile} from '@/lib/server/profiles';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string;mediaId:string}>}){const {id,mediaId}=await params;if(!/^[a-f0-9-]{36}$/.test(mediaId))return new Response(null,{status:404});const p=getProfile(id);if(!p||!p.photos.some(photo=>photo.id===mediaId&&photo.src===`/api/profile-media/${id}/${mediaId}`)||p.status!=='public'&&!await adminUser())return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});try{const bytes=readFileSync(join(process.env.DATA_DIR||join(process.cwd(),'data'),'photos','catalog',id,mediaId+'.webp'));return new Response(bytes,{headers:{...(p.status==='public'?{'Cache-Control':'public, max-age=0, must-revalidate','X-Content-Type-Options':'nosniff'}:privateHeaders),'Content-Type':'image/webp','Content-Security-Policy':"default-src 'none'; sandbox"}});}catch{return new Response(null,{status:404});}}
