import { applicationSchema } from "@/lib/application";
import { applicationDb, applicationBucket } from "@/db/applications";
import { MAX_PHOTO_BYTES, imageMime, validatePhotoSelection, type PhotoCategory } from '@/lib/space-photos';
import { notifyApplication } from "@/lib/notifications";
export const dynamic="force-dynamic";
function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
async function sha(value:BufferSource){const digest=await crypto.subtle.digest('SHA-256',value);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');}
// Bound the actual stream as well as Content-Length before parsing multipart data.
function boundedBody(request:Request,limit:number,contentType:string){
 const reader=request.body?.getReader();if(!reader)throw new Error('EMPTY');
 let size=0;
 const stream=new ReadableStream<Uint8Array>({
  async pull(controller){
   try{const {done,value}=await reader.read();if(done){reader.releaseLock();controller.close();return;}
    size+=value.byteLength;if(size>limit){await reader.cancel();controller.error(new Error('TOO_LARGE'));return;}controller.enqueue(value);
   }catch(error){controller.error(error);}
  },async cancel(){await reader.cancel();}
 });
 return new Response(stream,{headers:{'Content-Type':contentType}});
}
export async function POST(request:Request){
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return json({error:"请从本站申请入口提交。"},403);
 const contentType=request.headers.get('content-type')??'';
 const multipart=contentType.toLowerCase().startsWith('multipart/form-data;');
 if(!multipart&&!contentType.toLowerCase().includes('application/json'))return json({error:"不支持的提交格式。"},415);
 const limit=multipart?MAX_PHOTO_BYTES+1024*1024:16000;
 if(Number(request.headers.get('content-length')||0)>limit)return json({error:'提交内容过大，图片合计不得超过30MB。'},413);
 let raw:unknown;const photos:{category:PhotoCategory;file:File}[]=[];
 try{
  const body=boundedBody(request,limit,contentType);
  if(multipart){
   const form=await body.formData();
   const application=form.get('application');
   if(typeof application!=='string'||new TextEncoder().encode(application).length>16000)return json({error:'申请文字内容过长。'},400);
   raw=JSON.parse(application);
   for(const [key,value] of form.entries()){
    if(key==='application')continue;
    if((key!=='exterior'&&key!=='interior')||typeof value==='string')return json({error:'图片上传格式不正确。'},400);
    photos.push({category:key,file:value});
   }
  }else raw=JSON.parse(await body.text());
 }catch(error){return json({error:error instanceof Error&&error.message==='TOO_LARGE'?'提交内容过大，图片合计不得超过30MB。':'无法读取提交内容，请重试。'},error instanceof Error&&error.message==='TOO_LARGE'?413:400);}
 const parsed=applicationSchema.safeParse(raw);
 if(!parsed.success)return json({error:parsed.error.issues[0]?.message??"请检查填写内容。"},400);
 const data=parsed.data;
 if(data.type==='space'){const problem=validatePhotoSelection(photos);if(problem)return json({error:problem},400);}
 else if(photos.length)return json({error:'此类申请不接收空间图片。'},400);
 try{
  const db=applicationDb();
  const uploads:{key:string;category:PhotoCategory;name:string;size:number;contentType:string;sha256:string;file:File}[]=[];
  for(const [index,photo] of photos.entries()){
   const mime=imageMime(new Uint8Array(await photo.file.slice(0,16).arrayBuffer()));
   if(!mime||mime!==photo.file.type)return json({error:'图片内容与格式不符，请上传有效的 JPG、PNG 或 WebP 文件。'},400);
   const hash=await sha(await photo.file.arrayBuffer());
   uploads.push({key:`applications/${data.id}/${index}-${hash}`,category:photo.category,name:photo.file.name.slice(0,255),size:photo.file.size,contentType:mime,sha256:hash,file:photo.file});
  }
  const payload=JSON.stringify({...data,...(data.type==='space'?{photos:uploads.map(({file,...meta})=>meta)}:{})});
  const hash=await sha(new TextEncoder().encode(payload));
  const prior=await db.prepare("SELECT payload_hash FROM applications WHERE id = ?").bind(data.id).first<{payload_hash:string}>();
  if(prior){if(prior.payload_hash!==hash)return json({error:"此提交编号已使用，请关闭表单后重新申请。"},409);return json({reference:`KAV-${data.id}`,saved:true});}
  const since=new Date(Date.now()-24*60*60*1000).toISOString();
  const count=await db.prepare("SELECT COUNT(*) AS total FROM applications WHERE email = ? AND created_at >= ?").bind(data.email,since).first<{total:number}>();
  if((count?.total??0)>=5)return json({error:"此邮箱今日提交次数较多，请明天再试。"},429);
  // Keys are deterministic so retrying after a lost response does not duplicate files.
  if(uploads.length){const bucket=applicationBucket();for(const photo of uploads){await bucket.put(photo.key,photo.file.stream(),{httpMetadata:{contentType:photo.contentType},customMetadata:{applicationId:data.id,category:photo.category}});}}
  const createdAt=new Date().toISOString();
  await db.batch([
   db.prepare("INSERT INTO applications (id, type, name, email, payload, payload_hash, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'new') ON CONFLICT(id) DO NOTHING").bind(data.id,data.type,data.name,data.email,payload,hash,createdAt),
   db.prepare("INSERT INTO application_notifications (application_id,status,created_at) SELECT id,'pending',created_at FROM applications WHERE id=? AND payload_hash=? ON CONFLICT(application_id) DO NOTHING").bind(data.id,hash)
  ]);
  const saved=await db.prepare("SELECT payload_hash FROM applications WHERE id = ?").bind(data.id).first<{payload_hash:string}>();
  if(saved?.payload_hash!==hash)return json({error:"未能确认保存结果，请重试。"},409);
  try{await notifyApplication(data.id);}catch{console.error("notification_pending");}
  return json({reference:`KAV-${data.id}`,saved:true},201);
 }catch(error){console.error("application_save_failed",error instanceof Error?error.message:"storage error");return json({error:"暂时无法保存申请。填写内容和所选图片已保留，请稍后重试。"},503);}
}
