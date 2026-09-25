import { z } from "zod";
const line=z.string().trim().min(1,"请填写所有必填项").max(120,"填写内容过长");
const link=z.string().trim().max(500).refine(v=>!v||/^https?:\/\//i.test(v),"链接请以 https:// 或 http:// 开头").refine(v=>{if(!v)return true;try{return ['https:','http:'].includes(new URL(v).protocol);}catch{return false;}},"请输入有效链接");
export function normalizeWebsite(value:string){const v=value.trim();return !v||/^https?:\/\//i.test(v)?v:`http://${v.replace(/^\/\//,"")}`;}
const sponsorLink=z.string().transform(normalizeWebsite).pipe(link);
const base={locale:z.enum(["zh-Hans","ja","en","zh-Hant"]).optional(),id:z.string().uuid(),name:line,email:z.string().trim().email("请输入有效的电子邮箱").max(254).transform(v=>v.toLowerCase()),message:z.string().trim().min(5,"请简要填写至少5个字的申请说明").max(2000,"申请说明最多2000字"),consent:z.literal(true,{errorMap:()=>({message:"请先确认个人信息使用说明"})}),website:z.string().max(0)};
export const applicationSchema=z.discriminatedUnion("type",[
 z.object({...base,type:z.literal("artist"),location:line,category:z.enum(["绘画","雕塑与装置","摄影与影像","音乐与表演","设计与建筑","文学与跨学科","其他艺术领域"]),portfolio:link,availability:z.string().trim().max(120)}),
 z.object({...base,type:z.literal("sponsor"),organization:line,category:z.enum(["资金支持","物资与设备","专业服务","传播与媒体","综合合作"]),portfolio:sponsorLink}),
 z.object({...base,type:z.literal("space"),address:z.string().trim().min(1,"请填写空间地址").max(300,"空间地址最多300字"),location:line,category:z.enum(["别墅","露营地","艺术工作室","展览与活动空间","其他空间"]),availability:z.string().trim().max(120),authority:z.literal(true,{errorMap:()=>({message:"请确认您有权提交该空间的合作意向"})})})
]);
export type Application= z.infer<typeof applicationSchema>;
