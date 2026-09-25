"use client";
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MAX_PHOTO_BYTES, PHOTO_TYPES, type PhotoCategory } from '@/lib/space-photos';
export type SelectedPhoto={id:string;category:PhotoCategory;file:File};
function Thumbnail({file}:{file:File}){
 const [url,setUrl]=useState('');
 useEffect(()=>{const src=URL.createObjectURL(file);setUrl(src);return()=>URL.revokeObjectURL(src);},[file]);
 return url?<img src={url} alt={file.name}/>:null;
}
export function SpacePhotos({photos,onChange,disabled}:{photos:SelectedPhoto[];onChange:(v:SelectedPhoto[])=>void;disabled:boolean}){
 const [error,setError]=useState('');
 const total=photos.reduce((sum,p)=>sum+p.file.size,0);
 function add(category:PhotoCategory,files:FileList|null){
  if(!files)return;
  const selected=Array.from(files);
  if(selected.some(f=>!PHOTO_TYPES.includes(f.type)||f.size===0)){setError('请选择有效的 JPG、PNG 或 WebP 图片。');return;}
  if(total+selected.reduce((sum,f)=>sum+f.size,0)>MAX_PHOTO_BYTES){setError('图片总容量超过30MB，本次选择未添加。请减少图片或压缩后重试。');return;}
  setError('');onChange([...photos,...selected.map(file=>({id:crypto.randomUUID(),category,file}))]);
 }
 return <div className="space-photos full"><div className="photo-heading"><strong>空间图片 *</strong><span aria-live="polite">已选 {(total/1024/1024).toFixed(2)} / 30 MB</span></div><p className="field-note">请分别上传外观与内部设施，各至少1张。支持 JPG、PNG、WebP，全部图片合计不超过30MB。</p>
 {(['exterior','interior'] as const).map(category=><div className="photo-group" key={category}><label htmlFor={`photos-${category}`}>{category==='exterior'?'外观图片':'内部设施图片'} *<span className="field-note">{category==='exterior'?'建筑外立面、庭院或入口':'卧室、工作室、厨房、卫浴及其他配套设施'}</span></label><Input id={`photos-${category}`} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled} onChange={e=>{add(category,e.currentTarget.files);e.currentTarget.value='';}}/><ul className="photo-list">{photos.filter(p=>p.category===category).map(p=><li key={p.id}><Thumbnail file={p.file}/><div><span title={p.file.name}>{p.file.name}</span><small>{(p.file.size/1024/1024).toFixed(2)} MB</small></div><button type="button" disabled={disabled} aria-label={`移除${p.file.name}`} onClick={()=>{setError('');onChange(photos.filter(item=>item.id!==p.id));}}>移除</button></li>)}</ul></div>)}
 {error&&<p className="form-error" role="alert">{error}</p>}</div>;
}
