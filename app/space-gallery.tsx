"use client";
import {useRef,useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import {localizedText,photoCategories,photoCategoryNames,type PublicProfile} from '@/lib/profiles';
import {useLanguage} from './language';

export function SpaceGallery({profile}:{profile:PublicProfile}){
 const {locale,t}=useLanguage();
 const [category,setCategory]=useState('all'),[expanded,setExpanded]=useState(false),[activeId,setActiveId]=useState<string|null>(null);
 const touch=useRef<{x:number;y:number}|null>(null),opener=useRef<HTMLButtonElement|null>(null);
 const categories=photoCategories.filter(c=>profile.photos.some(p=>(p.category??'other')===c));
 const photos=profile.photos.filter(p=>category==='all'||(p.category??'other')===category);
 const active=photos.findIndex(p=>p.id===activeId),current=photos[active];
 const preview=category==='all'&&!expanded?photos.slice(0,8):photos;
 const move=(step:number)=>{if(photos.length)setActiveId(photos[(active+step+photos.length)%photos.length].id);};
 const caption=(photo:PublicProfile['photos'][number])=>localizedText(photo.alt,locale);
 return <section className="space-album" aria-label={t('空间相册')}>
  <div className="album-heading"><h2>{t('空间相册')}</h2><span>{profile.photos.length} {t('张实景照片')}</span></div>
  <div className="album-tabs" role="group" aria-label={t('按功能区查看')}>
   <button aria-pressed={category==='all'} onClick={()=>{setCategory('all');setExpanded(false);}}>{t('全部照片')} <span>{profile.photos.length}</span></button>
   {categories.map(c=><button key={c} aria-pressed={category===c} onClick={()=>{setCategory(c);setExpanded(false);}}>{t(photoCategoryNames[c])} <span>{profile.photos.filter(p=>(p.category??'other')===c).length}</span></button>)}
  </div>
  <div className={`album-grid ${category==='all'?'album-overview':''}`}>
   {preview.map((photo,index)=><button className="album-photo" key={photo.id} onClick={e=>{opener.current=e.currentTarget;setActiveId(photo.id);}} aria-label={`${t('查看大图')}：${caption(photo)}`}>
    <img src={photo.src} alt={caption(photo)} width={1200} height={800} loading={index===0?'eager':'lazy'} decoding="async"/>
    <span>{caption(photo)}</span>
   </button>)}
  </div>
  {category==='all'&&photos.length>8&&<button className="album-expand" onClick={()=>setExpanded(v=>!v)}>{t(expanded?'收起照片':'显示全部照片')} <span>{expanded?'−':`+${photos.length-8}`}</span></button>}
  <p className="album-note">{t('照片来自房源的 Airbnb 页面，设施使用条件以空间介绍及后续确认为准。')}</p>
  <Dialog open={activeId!==null} onOpenChange={open=>{if(!open)setActiveId(null);}}>
   <DialogContent className="photo-lightbox" showCloseButton={false} onCloseAutoFocus={e=>{e.preventDefault();opener.current?.focus();}} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key==='ArrowRight'){e.preventDefault();move(1);}}}>
    <div className="lightbox-heading"><div><DialogTitle>{localizedText(profile.names,locale)}</DialogTitle><DialogDescription>{t('使用左右按钮或方向键浏览，手机可左右滑动。')}</DialogDescription></div><DialogClose asChild><button className="lightbox-close" aria-label={t('关闭相册')}>×</button></DialogClose></div>
    {current&&<>
     <div className="lightbox-stage" onTouchStart={e=>{const point=e.touches[0];touch.current={x:point.clientX,y:point.clientY};}} onTouchEnd={e=>{const point=e.changedTouches[0],start=touch.current;touch.current=null;if(start&&Math.abs(point.clientX-start.x)>50&&Math.abs(point.clientY-start.y)<60)move(point.clientX<start.x?1:-1);}}>
      <img src={current.src} alt={caption(current)} width={1600} height={1100}/>
      <button className="lightbox-prev" onClick={()=>move(-1)} disabled={photos.length<2} aria-label={t('上一张照片')}>‹</button>
      <button className="lightbox-next" onClick={()=>move(1)} disabled={photos.length<2} aria-label={t('下一张照片')}>›</button>
     </div>
     <div className="lightbox-caption" aria-live="polite"><span>{t(photoCategoryNames[current.category??'other'])} · {caption(current)}</span><strong>{active+1} / {photos.length}</strong></div>
     <div className="lightbox-thumbnails" aria-label={t('照片缩略图')}>{photos.map(photo=><button key={photo.id} aria-label={caption(photo)} aria-pressed={photo.id===activeId} onClick={()=>setActiveId(photo.id)}><img src={photo.src} alt="" width={120} height={80} loading="lazy"/></button>)}</div>
    </>}
   </DialogContent>
  </Dialog>
 </section>;
}
