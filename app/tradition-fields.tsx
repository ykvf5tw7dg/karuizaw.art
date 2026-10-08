"use client";
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {traditionIds,traditionNames,type TraditionId} from '@/lib/meditation';
import {useLanguage} from './language';
export function TraditionFields({sponsor,scope,selected,onChange}:{sponsor:boolean;scope:'all'|'selected';selected:TraditionId[];onChange:(scope:'all'|'selected',selected:TraditionId[])=>void}){
 const {t}=useLanguage();
 return <fieldset className="tradition-fields full"><legend>{t(sponsor?'希望支持的实践传统／派别':'实践传统／派别')}{sponsor?' *':t('（选填）')}</legend>
 <p className="field-note">{t(sponsor?'可选择全部派别，或多选具体派别。':'仅用于了解实践方式与协调空间，可多选或留空。')}</p>
 <div className="tradition-options">
 {sponsor&&<label><Checkbox checked={scope==='all'} onCheckedChange={checked=>onChange(checked?'all':'selected',[])}/><span>{t('全部派别')}</span></label>}
 {traditionIds.map(id=><label key={id}><Checkbox checked={scope!=='all'&&selected.includes(id)} onCheckedChange={checked=>onChange('selected',checked?[...selected.filter(value=>value!==id),id]:selected.filter(value=>value!==id))}/><span>{t(traditionNames[id])}</span></label>)}
 </div>
 {scope!=='all'&&selected.includes('other')&&<label>{t('其他派别名称')} *<Input name="traditionOther" required maxLength={120}/></label>}
 {scope!=='all'&&<label>{t('具体派别或流派补充')}{t('（选填）')}<Input name="traditionDetail" maxLength={200}/></label>}
 </fieldset>;
}
