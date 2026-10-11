"use client";
import {useLanguage} from './language';
import {Input} from '@/components/ui/input';
export function ExperienceFields({names,value,onChange,teacher=false}:{names:Record<string,string>;value:string[];onChange:(value:string[])=>void;teacher?:boolean}){
 const {t}=useLanguage();
 return <fieldset className="experience-fields full"><legend>{t(teacher?'可带领的内容':'感兴趣的体验内容')}{teacher?' *':t('（选填）')}</legend><div className="experience-options">{Object.entries(names).map(([id,label])=><label key={id}><input type="checkbox" checked={value.includes(id)} onChange={e=>onChange(e.target.checked?[...value,id]:value.filter(v=>v!==id))}/><span>{t(label)}</span></label>)}</div>{value.includes('other')&&<label className="experience-other">{t('其他内容说明')}{teacher?' *':t('（选填）')}<Input name={teacher?'subjectOther':'interestOther'} required={teacher} maxLength={200}/></label>}<p className="field-note">{t(teacher?'填写可带领的内容，具体活动与合作条件另行沟通。':'用于了解参与兴趣，不代表已预约课程；活动按场地与带领者安排协调。')}</p></fieldset>;
}
