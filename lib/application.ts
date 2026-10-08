import { z } from "zod";
import { traditionIds } from "./meditation";
const line=z.string().trim().min(1,"请填写所有必填项").max(120,"填写内容过长");
const link=z.string().trim().max(500).refine(v=>!v||/^https?:\/\//i.test(v),"链接请以 https:// 或 http:// 开头").refine(v=>{if(!v)return true;try{return ['https:','http:'].includes(new URL(v).protocol);}catch{return false;}},"请输入有效链接");
export function normalizeWebsite(value:string){const v=value.trim();return !v||/^https?:\/\//i.test(v)?v:`http://${v.replace(/^\/\//,"")}`;}
const sponsorLink=z.string().transform(normalizeWebsite).pipe(link);
const base={locale:z.enum(["zh-Hans","ja","en","zh-Hant"]).optional(),id:z.string().uuid(),name:line,email:z.string().trim().email("请输入有效的电子邮箱").max(254).transform(v=>v.toLowerCase()),message:z.string().trim().min(5,"请简要填写至少5个字的申请说明").max(2000,"申请说明最多2000字"),consent:z.literal(true,{errorMap:()=>({message:"请先确认个人信息使用说明"})}),website:z.string().max(0)};
const traditions={traditionText:z.string().trim().max(300,"派别说明最多300字").optional(),traditions:z.array(z.enum(traditionIds)).max(8).default([]),traditionOther:z.string().trim().max(120).default(""),traditionDetail:z.string().trim().max(200).default("")};
export const applicationSchema=z.discriminatedUnion("type",[
 z.object({...base,type:z.literal("artist"),location:line,category:z.enum(["绘画","雕塑与装置","摄影与影像","音乐与表演","设计与建筑","文学与跨学科","其他艺术领域"]),portfolio:link,availability:z.string().trim().max(120)}),
 z.object({...base,type:z.literal("sponsor"),organization:line,category:z.enum(["资金支持","物资与设备","专业服务","传播与媒体","综合合作"]),portfolio:sponsorLink,supportPlan:z.enum(["artist","meditation","all"]).default("artist"),traditionScope:z.enum(["all","selected"]).default("selected"),...traditions}),
 z.object({...base,type:z.literal("meditation"),applicationMode:z.enum(["individual","group"]),location:line,participants:z.coerce.number().int().min(1,"请填写有效人数"),availability:line,organization:z.string().trim().max(120).default(""),leader:z.string().trim().max(120).default(""),groupActivities:z.string().trim().max(500).default(""),spaceNeeds:z.string().trim().min(1,"请填写空间与配套需求").max(1000),budget:z.string().trim().max(120).default(""),...traditions}),
 z.object({...base,type:z.literal("space"),address:z.string().trim().min(1,"请填写空间地址").max(300,"空间地址最多300字"),location:line,category:z.enum(["别墅","露营地","艺术工作室","展览与活动空间","其他空间"]),availability:z.string().trim().max(120),authority:z.literal(true,{errorMap:()=>({message:"请确认您有权提交该空间的合作意向"})})})
]).superRefine((data,ctx)=>{
 const issue=(path:string,message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,path:[path],message});
 if(data.type!=="meditation"&&data.type!=="sponsor")return;
 if(data.type==="sponsor"&&data.supportPlan==="artist")return;
 if(data.traditionText===undefined){
 if(new Set(data.traditions).size!==data.traditions.length)issue("traditions","请勿重复选择派别");
 if(data.type==="sponsor"&&data.traditionScope==="all"){
  if(data.traditions.length||data.traditionOther||data.traditionDetail)issue("traditions","全部派别不能与具体派别同时选择");
 }else{
  if(data.type==="sponsor"&&!data.traditions.length)issue("traditions","请选择希望支持的派别或全部派别");
  if(data.traditions.includes("other")&&!data.traditionOther)issue("traditionOther","请填写其他派别名称");
  if(!data.traditions.includes("other")&&data.traditionOther)issue("traditionOther","请先选择其他派别");
 }
 }
 if(data.type==="meditation"){
  if(data.applicationMode==="individual"&&data.participants!==1)issue("participants","个人申请人数应为1人");
  if(data.applicationMode==="group"){
   if(data.participants<2)issue("participants","团体申请至少2人");
   if(!data.organization)issue("organization","请填写团体名称");
   if(!data.leader)issue("leader","请填写团体带领者");
   if(!data.groupActivities)issue("groupActivities","请填写团体活动安排简介");
  }
 }
});
export type Application= z.infer<typeof applicationSchema>;
