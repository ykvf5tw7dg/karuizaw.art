export const MAX_PHOTO_BYTES = 30 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export type PhotoCategory = 'exterior' | 'interior';
export function validatePhotoSelection(photos: {category:PhotoCategory;file:{size:number;type:string}}[]){
 if(!photos.some(p=>p.category==='exterior'))return '请至少上传一张空间外观图片。';
 if(!photos.some(p=>p.category==='interior'))return '请至少上传一张内部设施图片。';
 if(photos.some(p=>!PHOTO_TYPES.includes(p.file.type)||p.file.size===0))return '请选择有效的 JPG、PNG 或 WebP 图片。';
 if(photos.reduce((total,p)=>total+p.file.size,0)>MAX_PHOTO_BYTES)return '外观与内部设施图片合计不能超过30MB，请移除部分图片后重试。';
 return null;
}
export function imageMime(bytes:Uint8Array):string|null{
 if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'image/jpeg';
 if([137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))return 'image/png';
 if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')return 'image/webp';
 return null;
}
