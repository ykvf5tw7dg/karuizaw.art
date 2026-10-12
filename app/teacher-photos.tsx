"use client";
import {useState} from 'react';
import {useLanguage} from './language';
import {Thumbnail,type SelectedPhoto} from './space-photos';
import {TEACHER_PHOTO_CATEGORIES,validateTeacherPhotos} from '@/lib/space-photos';
const names={portrait:'个人照片',work:'工作场景',teaching:'授课与带领场景'};
export function TeacherPhotos({photos,onChange,disabled}:{photos:SelectedPhoto[];onChange:(photos:SelectedPhoto[])=>void;disabled:boolean}){
 const {t}=useLanguage(),[error,setError]=useState('');
 const total=photos.reduce((sum,p)=>sum+p.file.size,0);
 return <div className="space-photos full"><div className="photo-heading"><strong>{t('老师照片（选填，最多6张）')}</strong><span aria-live="polite">{photos.length} / 6 · {(total/1024/1024).toFixed(2)} / 30 MB</span></div><p className="field-note">{t('可上传个人照片、工作及授课场景。每张最多10MB，合计不超过30MB；仅供管理员查看。')}</p>{TEACHER_PHOTO_CATEGORIES.map(category=><div className="photo-group" key={category}><label htmlFor={`teacher-photos-${category}`}>{t(names[category])}</label><div className="photo-picker"><label className="photo-choose" htmlFor={`teacher-photos-${category}`}>{t('选择图片')}</label><input className="sr-only" id={`teacher-photos-${category}`} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled||photos.length>=6} onChange={e=>{const next=[...photos,...Array.from(e.currentTarget.files??[]).map(file=>({id:crypto.randomUUID(),category,file}))];e.currentTarget.value='';const problem=validateTeacherPhotos(next);if(problem){setError(problem);return;}setError('');onChange(next);}}/></div><ul className="photo-list">{photos.filter(p=>p.category===category).map(p=><li key={p.id}><Thumbnail file={p.file}/><div><span>{p.file.name}</span><small>{(p.file.size/1024/1024).toFixed(2)} MB</small></div><button type="button" disabled={disabled} aria-label={`${t('移除')} ${p.file.name}`} onClick={()=>{setError('');onChange(photos.filter(x=>x.id!==p.id));}}>{t('移除')}</button></li>)}</ul></div>)}{error&&<p role="alert" className="form-error">{t(error)}</p>}</div>;
}
