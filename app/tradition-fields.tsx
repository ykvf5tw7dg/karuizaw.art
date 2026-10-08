"use client";
import {Input} from '@/components/ui/input';
import {useLanguage} from './language';
export function TraditionFields({sponsor}:{sponsor:boolean}){
 const {t}=useLanguage();
 const label=t(sponsor?'希望支持的实践传统／派别':'实践传统／派别');
 return <label className="tradition-fields full">{label}{t('（选填）')}
 <Input name="traditionText" maxLength={300} placeholder={t(sponsor?'可填写希望支持的派别或实践方式，不限定可留空':'可填写派别、流派或实践方式，不限定可留空')}/>
 <span className="field-note">{t('仅用于了解实践方式与协调空间，资料不在网站公开展示。')}</span>
 </label>;
}
