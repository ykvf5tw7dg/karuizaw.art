"use client";
import {useEffect,useState} from 'react';
import {Eye,LockKeyhole} from 'lucide-react';
import {useLanguage} from './language';
// One request per loaded document, including React effect replays and language switches.
let visitRequest:Promise<number>|undefined;
function recordVisit(){return visitRequest??=fetch('/api/visits',{method:'POST',headers:{'X-Visit-Source':'homepage'}}).then(async response=>{
 if(!response.ok)throw new Error('counter unavailable');
 const data=await response.json() as {total?:unknown};
 if(typeof data?.total!=='number'||!Number.isSafeInteger(data.total)||data.total<0)throw new Error('invalid count');
 return data.total as number;
});}
export function FooterUtilities(){
 const {t,locale}=useLanguage();
 const [total,setTotal]=useState<number|null>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;recordVisit().then(value=>{if(active)setTotal(value);}).catch(()=>{if(active)setFailed(true);});return()=>{active=false;};},[]);
 return <div className="footer-utilities">
  <span className="visit-counter" title={t(failed?'访问计数暂不可用':'计数启用后的首页浏览次数')}><Eye size={13} aria-hidden="true"/><span>{t('访问次数')} · {total===null?'—':new Intl.NumberFormat(locale).format(total)}</span></span>
  <a className="admin-entry" href="/manage/applications" target="_top" aria-label={t('管理员入口')} title={t('管理员入口')}><LockKeyhole size={14} aria-hidden="true"/></a>
 </div>;
}
