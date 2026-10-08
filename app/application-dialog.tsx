"use client";
import { useLanguage } from "./language";
import { useRef, useState, type FormEvent } from "react";
import { Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectItem } from "@/components/ui/select";
import { SpacePhotos, type SelectedPhoto } from "./space-photos";
import { validatePhotoSelection } from "@/lib/space-photos";
import { applicationSchema } from "@/lib/application";
import {TraditionFields} from "./tradition-fields";
import {supportPlanNames,type TraditionId} from "@/lib/meditation";
export type ApplicationKind="artist"|"sponsor"|"space"|"meditation";
const info={
 meditation:{title:"登记禅修意向",en:"MEDITATION RESIDENCY INTEREST",intro:"面向个人自主禅修及团体自带带领者的活动，协调淡季住宿、安静空间与配套服务。具体支持条件另行沟通。",categories:[],category:"",message:"实践目的与驻留意向",placeholder:"请介绍你的实践方式，以及此次驻留希望开展的活动……"},
 artist:{title:"登记驻留意向",en:"RESIDENCY INTEREST",intro:"首批计划招募100位各类艺术家，年度驻留目标为30–50位。欢迎介绍你的创作实践。",categories:["绘画","雕塑与装置","摄影与影像","音乐与表演","设计与建筑","文学与跨学科","其他艺术领域"],category:"主要艺术领域",message:"艺术经历与驻留创作意向",placeholder:"请简要介绍艺术经历，以及希望在轻井泽开展的创作……"},
 sponsor:{title:"登记赞助意向",en:"SPONSORSHIP INTEREST",intro:"期待与伙伴共同支持艺术活动、禅修与静心驻留，可提供资金、物资或专业服务。",categories:["资金支持","物资与设备","专业服务","传播与媒体","综合合作"],category:"希望提供的支持",message:"合作意向",placeholder:"请介绍可提供的支持、合作方向或希望了解的事项……"},
 space:{title:"登记空间意向",en:"SPACE PARTNERSHIP INTEREST",intro:"面向轻井泽及周边的别墅、露营地和艺术活动空间。请介绍你的空间与合作想法。",categories:["别墅","露营地","艺术工作室","展览与活动空间","其他空间"],category:"空间类型",message:"空间介绍与合作意向",placeholder:"请介绍空间面积、可容纳人数、设施及希望开展的合作……"}
};
export function ApplicationDialog({kind,onClose}:{kind:ApplicationKind|null;onClose:()=>void}){
 const {t,locale}=useLanguage();
 const [category,setCategory]=useState("");const [consent,setConsent]=useState(false);const [authority,setAuthority]=useState(false);
 const [pending,setPending]=useState(false);const [error,setError]=useState("");const [receipt,setReceipt]=useState("");const id=useRef("");
 const [sponsorWebsite,setSponsorWebsite]=useState("");const [websiteProtocol,setWebsiteProtocol]=useState("http://");
 const [photos,setPhotos]=useState<SelectedPhoto[]>([]);
 const [supportPlan,setSupportPlan]=useState<"artist"|"meditation"|"all"|"">("");
 const [applicationMode,setApplicationMode]=useState<"individual"|"group">("individual");
 const [traditionScope,setTraditionScope]=useState<"all"|"selected">("selected");
 const [traditions,setTraditions]=useState<TraditionId[]>([]);
 const content=info[kind??"artist"];
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(pending||!kind)return;setError("");
  const fields=Object.fromEntries(new FormData(e.currentTarget));
  if(!id.current)id.current=crypto.randomUUID();
  const parsed=applicationSchema.safeParse({...fields,...(kind==="sponsor"?{portfolio:sponsorWebsite.trim()?websiteProtocol+sponsorWebsite.trim():""}:{}),...(kind==="sponsor"?{supportPlan,traditionScope:supportPlan==="artist"?"selected":traditionScope,traditions:supportPlan==="artist"?[]:traditions,traditionOther:fields.traditionOther??"",traditionDetail:fields.traditionDetail??""}:{}),...(kind==="meditation"?{applicationMode,traditions,participants:applicationMode==="individual"?1:fields.participants}:{}),id:id.current,locale,type:kind,category,consent,authority});
  if(!parsed.success){setError(parsed.error.issues[0]?.code==="invalid_enum_value"?t("请选择"):parsed.error.issues[0]?.message??t("请检查填写内容"));return;}
  if(kind==="space"){const problem=validatePhotoSelection(photos);if(problem){setError(problem);return;}}
  setPending(true);
  try{let body:BodyInit=JSON.stringify(parsed.data);let headers:HeadersInit|undefined={'Content-Type':'application/json'};if(kind==='space'){const form=new FormData();form.append('application',JSON.stringify(parsed.data));photos.forEach(photo=>form.append(photo.category,photo.file));body=form;headers=undefined;}const response=await fetch('/api/applications',{method:'POST',headers,body});const data=await response.json() as {error?:string;reference?:string};if(!response.ok)throw new Error(data.error??t("提交暂时不可用，请稍后重试。"));if(!data.reference)throw new Error(t("暂未确认保存成功，请重试。"));setReceipt(data.reference);}
  catch(err){setError(err instanceof Error?err.message:t("网络连接失败，填写内容已保留，请稍后重试。"));}
  finally{setPending(false);}
 }
 return <Dialog open={kind!==null} onOpenChange={open=>{if(!open&&!pending)onClose();}}><DialogContent className="application-dialog" showCloseButton={false} onEscapeKeyDown={e=>{if(pending)e.preventDefault();}} onPointerDownOutside={e=>{e.preventDefault();}}>
 <DialogClose asChild><button type="button" className="dialog-close" disabled={pending} aria-label={t("关闭申请表")}>×</button></DialogClose>
 <span className="form-eyebrow">{content.en}</span><DialogTitle className="form-title">{receipt?t("意向已收到"):t(content.title)}</DialogTitle><DialogDescription className="form-description">{receipt?t("感谢你参与轻井泽国际艺术村的共建。"):t(content.intro)}</DialogDescription>
 {receipt?<div className="receipt" role="status"><span>{t("登记编号")}</span><strong>{receipt}</strong><p>{t("已收到您的合作意向。请保留此编号，筹备团队将根据所填信息与您进一步联络。")}</p><p>{t("本次提交为合作意向，不代表录取或合作确认。")}</p><Button className="submit-button" onClick={onClose}>{t("返回艺术村")}</Button></div>:<form onSubmit={submit} className="application-form">
 <p className="form-help">{t("这些信息将帮助我们匹配适合的计划、档期与合作方式。")}</p>
 <p className="form-help">{t("标有 * 的项目为必填。无需提交证件、银行或付款信息。")}</p>
 <fieldset disabled={pending}>
 <div className="form-grid">
 <label>{t("姓名 / 联系人 *")}<Input name="name" autoComplete="name" required maxLength={120} placeholder={t("如何称呼你")}/></label>
 <label>{t("电子邮箱 *")}<Input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="name@example.com"/></label>
 {(kind==="sponsor"||kind==="space")&&<label className="full">{kind==="space"?t("空间地址"):t("企业 / 品牌 / 机构名称（个人填姓名）")} *<Input name={kind==="space"?"address":"organization"} required maxLength={kind==="space"?300:120} placeholder={kind==="space"?t("请填写空间完整地址（含町名、地番或门牌号）"):t("合作主体名称")}/></label>}
 {kind!=="sponsor"&&<label>{kind==="space"?t("所在区域"):t("常驻国家 / 城市")} *<Input name="location" required maxLength={120} placeholder={kind==="space"?t("如：轻井泽町长仓"):t("如：中国 · 上海")}/></label>}
 {kind!=="meditation"&&<div className={kind==="sponsor"?"field full":"field"}><label htmlFor="category">{t(content.category)} *</label><Select value={category} onValueChange={setCategory}><SelectTrigger id="category" className="form-select" aria-required="true"><SelectValue placeholder={t("请选择")}/></SelectTrigger><SelectContent>{content.categories.map(c=><SelectItem key={c} value={c}>{t(c)}</SelectItem>)}</SelectContent></Select></div>}
 {kind!=="meditation"&&(kind==="space"?<SpacePhotos photos={photos} onChange={setPhotos} disabled={pending}/>:<label className="full">{kind==="artist"?t("作品集链接"):t("品牌 / 机构网站")}{t("（选填）")}{kind==="sponsor"?<div className="website-input"><span aria-hidden="true">{websiteProtocol}</span><Input type="text" inputMode="url" maxLength={500} placeholder="www.example.com" aria-describedby="website-help" value={sponsorWebsite} onChange={e=>{const value=e.target.value;const protocol=value.match(/^https?:\/\//i)?.[0];if(protocol)setWebsiteProtocol(protocol.toLowerCase());setSponsorWebsite(value.replace(/^https?:\/\//i, "").replace(/^\/\//,""));}}/></div>:<Input name="portfolio" type="url" maxLength={500} placeholder="https://"/>}<span id="website-help" className="field-note">{kind==="sponsor"?t("直接填写域名即可，自动补全 http://；也可粘贴完整网址。"):t("可提供网页或云盘链接，不在网站公开展示。")}</span></label>)}
 {kind!=="sponsor"&&<label className="full">{kind!=="space"?t("期望驻留时间与时长"):t("可合作时间")}{kind==="meditation"?" *":t("（选填）")}<Input name="availability" required={kind==="meditation"} maxLength={120} placeholder={t("可填写大致时间，或填写待沟通")}/></label>}
 {kind==="sponsor"&&<div className="field full"><label htmlFor="support-plan">{t("希望支持的计划")} *</label><Select value={supportPlan} onValueChange={value=>{setSupportPlan(value as typeof supportPlan);setTraditions([]);setTraditionScope("selected");}}><SelectTrigger id="support-plan" className="form-select" aria-required="true"><SelectValue placeholder={t("请选择")}/></SelectTrigger><SelectContent>{Object.entries(supportPlanNames).map(([id,label])=><SelectItem key={id} value={id}>{t(label)}</SelectItem>)}</SelectContent></Select></div>}
 {kind==="meditation"&&<><div className="field full"><label htmlFor="application-mode">{t("申请方式")} *</label><Select value={applicationMode} onValueChange={value=>setApplicationMode(value as typeof applicationMode)}><SelectTrigger id="application-mode" className="form-select"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="individual">{t("个人")}</SelectItem><SelectItem value="group">{t("团体")}</SelectItem></SelectContent></Select></div>
 {applicationMode==="group"&&<><label>{t("团体名称")} *<Input name="organization" required maxLength={120}/></label><label>{t("预计人数")} *<Input name="participants" type="number" min={2} step={1} required/></label><label className="full">{t("团体带领者")} *<Input name="leader" required maxLength={120}/></label><label className="full">{t("团体活动安排简介")} *<Textarea name="groupActivities" required maxLength={500} rows={3}/></label></>}
 <label className="full">{t("空间与配套需求")} *<Textarea name="spaceNeeds" required maxLength={1000} rows={3} placeholder={t("请介绍房间、安静活动空间、餐食及交通等需求……")}/></label><label className="full">{t("可接受的住宿预算")}{t("（选填）")}<Input name="budget" maxLength={120} placeholder={t("请注明币种，以及每人每晚或整体预算")}/></label></>}
 {(kind==="meditation"||(kind==="sponsor"&&supportPlan!==""&&supportPlan!=="artist"))&&<TraditionFields sponsor={kind==="sponsor"} scope={kind==="meditation"?"selected":traditionScope} selected={traditions} onChange={(scope,ids)=>{setTraditionScope(scope);setTraditions(ids);}}/>}
 <label className="full">{t(content.message)} *<Textarea name="message" required minLength={5} maxLength={2000} rows={4} placeholder={t(content.placeholder)}/><span className="field-note">{t("5–2000 字。")}</span></label>
 </div>
 <div className="honeypot" aria-hidden="true"><label>{t("网站地址")}<Input name="website" tabIndex={-1} autoComplete="off"/></label></div>
 {kind==="space"&&<div className="consent-row"><Checkbox id="authority" checked={authority} onCheckedChange={v=>setAuthority(v===true)}/><label htmlFor="authority">{t("我为该空间的所有人或获得授权的代表，有权提交合作意向。")}</label></div>}
 <div className="privacy-note"><strong>{t("个人信息使用说明")}</strong><p>{t("你提交的资料由轻井泽国际艺术中心（筹）筹备团队用于本次申请评估与联络，并通过网站服务保存，不在网站公开展示。请仅提供你有权提交的资料；作品资料仅用于申请评估，不构成版权转让或商业使用授权。")}</p></div>
 <div className="consent-row"><Checkbox id="consent" checked={consent} onCheckedChange={v=>setConsent(v===true)}/><label htmlFor="consent">{t("我已阅读上述说明，同意保存申请资料并用于本次申请评估及联络。*")}</label></div>
 <p className="form-help">{t("提交申请不产生付款义务，也不代表录取、赞助承诺或空间合作成立。具体条件另行协商。")}</p>
 {error&&<p className="form-error" role="alert">{t(error)}</p>}
 <Button type="submit" className="submit-button" disabled={pending}>{pending?(kind==="space"?t("正在上传图片并保存，请稍候…"):t("正在保存申请…")):t("提交意向登记")}<span aria-hidden="true">↗</span></Button>
 </fieldset></form>}
 </DialogContent></Dialog>;
}
