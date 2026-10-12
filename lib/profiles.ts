import {z} from 'zod';
import type {Locale} from './locales';
export const profileLocales=['zh-Hans','zh-Hant','ja','en'] as const;
export type Localized=Record<Locale,string>;
export const emptyLocalized=():Localized=>({'zh-Hans':'','zh-Hant':'',ja:'',en:''});
const localized=(max:number)=>z.object({'zh-Hans':z.string().trim().max(max),'zh-Hant':z.string().trim().max(max),ja:z.string().trim().max(max),en:z.string().trim().max(max)}).strict();
export const photoCategories=['exterior','living','bedroom','bathroom','kitchen','dining','outdoor','laundry','layout','other'] as const;
export const photoCategoryNames:Record<(typeof photoCategories)[number],string>={exterior:'外观',living:'客厅与休息区',bedroom:'卧室与住宿',bathroom:'卫浴',kitchen:'厨房',dining:'用餐区',outdoor:'庭院与户外',laundry:'洗衣区',layout:'平面图',other:'其他空间'};
export const maxSpacePhotos=20;
const photo=z.object({id:z.string().regex(/^[a-z0-9-]{1,80}$/),src:z.string().regex(/^\/(partners\/spaces\/[a-z0-9-]+\/[a-z0-9-]+\.webp|api\/profile-media\/[a-z0-9-]+\/[a-f0-9-]{36})$/),alt:localized(200),category:z.enum(photoCategories).optional()}).strict();
export const profileSchema=z.object({
 kind:z.enum(['space','teacher']),status:z.enum(['draft','public']),sort:z.number().int().min(0).max(999),
 names:localized(120),summary:localized(700),details:localized(6000),location:localized(200),features:localized(1000),
 sleepingCapacity:z.number().int().min(1).max(100).nullable(),sleepingCapacityMax:z.number().int().min(1).max(100).nullable().optional(),practiceCapacity:z.number().int().min(1).max(100).nullable(),
 languages:z.array(z.enum(profileLocales)).max(4),teachingModes:z.array(z.enum(['individual','group'])).max(2),
 sourceUrl:z.string().trim().max(500).refine(v=>{if(!v)return true;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}},'资料链接须为有效的 HTTPS 网址。'),
 photos:z.array(photo).max(maxSpacePhotos),internalNotes:z.string().trim().max(4000)
}).strict().superRefine((p,ctx)=>{
 const issue=(message:string)=>ctx.addIssue({code:'custom',message});
 if(p.sleepingCapacityMax!=null&&(p.sleepingCapacity==null||p.sleepingCapacityMax<p.sleepingCapacity))issue('住宿人数上限不能小于下限，且需填写下限。');
 if(p.kind==='teacher'&&p.photos.length>1)issue('老师介绍仅使用一张本人照片。');
 if(new Set(p.photos.map(v=>v.id)).size!==p.photos.length)issue('图片不能重复。');
 if(new Set(p.languages).size!==p.languages.length||new Set(p.teachingModes).size!==p.teachingModes.length)issue('请勿重复选择。');
 if(p.status==='public'){
  if(profileLocales.some(l=>!p.names[l]||!p.summary[l]))issue('公开前请填写四种语言的名称与简介。');
  if(!p.photos.length)issue('公开前请添加空间实景或老师本人照片。');
  if(p.photos.some(photo=>profileLocales.some(l=>!photo.alt[l])))issue('公开前请填写四种语言的图片说明。');
  if(p.kind==='teacher'&&(!p.languages.length||!p.teachingModes.length))issue('公开老师介绍前请填写可用语言与带领方式。');
 }
});
export type ProfilePayload=z.infer<typeof profileSchema>;
export type Profile=ProfilePayload & {id:string;revision:number;updatedAt:string};
export type PublicProfile=Omit<Profile,'internalNotes'|'revision'|'updatedAt'>;
export function localizedText(text:Localized,locale:Locale){return text[locale]||text['zh-Hans'];}
export const validProfileId=(id:string)=>/^[a-z0-9-]{1,80}$/.test(id);
export function blankProfile(kind:'space'|'teacher'):ProfilePayload{return {kind,status:'draft',sort:50,names:emptyLocalized(),summary:emptyLocalized(),details:emptyLocalized(),location:emptyLocalized(),features:emptyLocalized(),sleepingCapacity:null,practiceCapacity:null,languages:[],teachingModes:[],sourceUrl:'',photos:[],internalNotes:''};}

export function sleepingCapacityText(p:Pick<ProfilePayload,'sleepingCapacity'|'sleepingCapacityMax'>):string|null{if(p.sleepingCapacity==null)return null;return p.sleepingCapacityMax!=null&&p.sleepingCapacityMax>p.sleepingCapacity?`${p.sleepingCapacity}–${p.sleepingCapacityMax}`:String(p.sleepingCapacity);}
