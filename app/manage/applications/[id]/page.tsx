import {displayTraditions,supportPlanNames} from '@/lib/meditation';
import { requireAdmin } from '@/lib/admin';
import { getApplication,parsePayload,storedPhotos,kindNames,displayDate } from '@/db/admin-applications';
import { AccessDenied } from '../../access-denied';
export const dynamic='force-dynamic';
export default async function ApplicationPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ApplicationDetail id={id}/>;}
async function ApplicationDetail({id}:{id:string}){
 const user=await requireAdmin(`/manage/applications/${encodeURIComponent(id)}`);if(!user)return <AccessDenied/>;
 try{
 const row=await getApplication(id);if(!row)return <section className="manage-notice"><h1>未找到该申请</h1><a href="/manage/applications">返回申请列表</a></section>;
 const data=parsePayload(row);const photos=storedPhotos(row);
 const fields:[string,unknown][]=[['姓名 / 联系人',row.name],['电子邮箱',row.email],['提交时间（日本时间）',displayDate(row.created_at)],['空间地址',data.address],[row.type==='meditation'?'团体名称':row.type==='space'?'原空间名称':'企业 / 品牌 / 机构名称',data.organization],['所在国家 / 区域',data.location],['申请类别',data.category],['可合作 / 驻留时间',data.availability]];
 if(row.type==='meditation')fields.push(['申请方式',data.applicationMode==='group'?'团体':'个人'],['预计人数',String(data.participants??'')],['团体带领者',data.leader],['团体活动安排简介',data.groupActivities],['空间与配套需求',data.spaceNeeds],['可接受的住宿预算',data.budget]);
 if(row.type==='sponsor')fields.push(['希望支持的计划',supportPlanNames[data.supportPlan as keyof typeof supportPlanNames]??'艺术家与艺术活动（历史申请）']);
 if(row.type==='meditation'||row.type==='sponsor'){fields.push(['实践传统／派别',displayTraditions(data)]);if(data.traditionText===undefined)fields.push(['其他派别名称',data.traditionOther],['具体派别或流派补充',data.traditionDetail]);}
 const link=typeof data.portfolio==='string'&&/^https?:\/\//i.test(data.portfolio)?data.portfolio:null;
 return <><a className="manage-back" href="/manage/applications">← 返回申请列表</a><div className="manage-title"><div><p>{kindNames[row.type]??'申请资料'}</p><h1>{row.name}</h1><span className="manage-reference">KAV-{row.id}</span></div></div><dl className="manage-fields">{fields.filter(([,value])=>typeof value==='string'&&value).map(([name,value])=><div key={name}><dt>{name}</dt><dd>{String(value)}</dd></div>)}</dl>
 <section className="manage-content"><h2>申请说明与合作意向</h2><p>{typeof data.message==='string'?data.message:'—'}</p>{link&&<p><a href={link} target="_blank" rel="noopener noreferrer">{row.type==='artist'?'查看作品集':row.type==='sponsor'?'查看机构网站':'查看原空间资料链接'} ↗</a></p>}</section>
 {row.type==='space'&&<section className="manage-content"><h2>空间图片</h2>{!photos.length?<p>此申请未附图片（可能为旧版表单提交）。</p>:<div className="manage-photos">{photos.map((photo,index)=><figure key={photo.key}><a href={`/api/manage/applications/${row.id}/photos/${index}`} target="_blank" rel="noopener noreferrer"><img src={`/api/manage/applications/${row.id}/photos/${index}`} alt={`${photo.category==='exterior'?'外观':'内部设施'}：${photo.name}`} loading="lazy"/></a><figcaption><strong>{photo.category==='exterior'?'外观':'内部设施'}</strong><span>{photo.name}</span><small>{(photo.size/1024/1024).toFixed(2)} MB</small></figcaption></figure>)}</div>}</section>}
 <p className="manage-security">申请人已同意资料用于申请评估与联络。{data.authority===true?'已确认具有空间合作申请权限。':''}请勿对外公开申请资料。</p></>;
 }catch{return <section className="manage-notice"><h1>暂时无法读取申请</h1><p>请稍后刷新重试。</p></section>;}
}
