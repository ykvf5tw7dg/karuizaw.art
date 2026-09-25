import { requireAdmin } from '@/lib/admin';
import { applicationDb } from '@/db/applications';
import { kindNames,displayDate,type ApplicationRow } from '@/db/admin-applications';
import { AccessDenied } from '../access-denied';
import { Table,TableHeader,TableBody,TableRow,TableHead,TableCell } from '@/components/ui/table';
import { mailReady } from '@/lib/notifications';
import { NotificationRetry } from '../notification-retry';
export const dynamic='force-dynamic';
export default async function ApplicationsPage({searchParams}:{searchParams:Promise<{page?:string}>}){const query=await searchParams;const page=Math.min(200,Math.max(1,Number.parseInt(query.page??'1',10)||1));return <ApplicationList page={page}/>;}
async function ApplicationList({page}:{page:number}){
 const user=await requireAdmin(`/manage/applications?page=${page}`);if(!user)return <AccessDenied/>;
 try{
 const db=applicationDb();const rows=await db.prepare('SELECT id,type,name,email,created_at,status FROM applications ORDER BY created_at DESC LIMIT 51 OFFSET ?').bind((page-1)*50).all<ApplicationRow>();
 const total=await db.prepare('SELECT COUNT(*) AS count FROM applications').first<{count:number}>();
 const pending=await db.prepare("SELECT COUNT(*) AS count FROM application_notifications WHERE status != 'sent'").first<{count:number}>();
 return <><div className="manage-title"><div><p>APPLICATIONS · 申请资料</p><h1>收到的申请</h1><span>共 {total?.count??0} 份 · 时间为日本时间</span></div><a className="manage-button" href="/manage/applications">刷新列表</a></div>
 <section className="manage-mail"><strong>{mailReady()?"新申请邮件通知已配置":"即时邮件通知尚未启用"}</strong><p>{mailReady()?`有 ${pending?.count??0} 封通知等待发送。`:`发信服务尚未接入；申请会正常保存，当前有 ${pending?.count??0} 封通知待发送。`}</p>{mailReady()&&<NotificationRetry/>}</section>
 <p className="manage-security">已登录：{user.email}。每次访问申请详情和图片均会验证管理员身份；转发链接不会授予他人查看权限。</p>
 {!rows.results.length?<section className="manage-notice"><h2>暂未收到申请</h2><p>申请提交成功后会自动出现在这里。</p></section>:<div className="manage-table"><Table><TableHeader><TableRow><TableHead>提交时间</TableHead><TableHead>申请类型</TableHead><TableHead>姓名 / 联系人</TableHead><TableHead>邮箱</TableHead><TableHead>查看</TableHead></TableRow></TableHeader><TableBody>{rows.results.slice(0,50).map(row=><TableRow key={row.id}><TableCell>{displayDate(row.created_at)}</TableCell><TableCell>{kindNames[row.type]??row.type}</TableCell><TableCell>{row.name}</TableCell><TableCell><a className="manage-detail-link" href={`mailto:${encodeURIComponent(row.email)}`} title="使用邮件应用联系申请人" aria-label={`发送邮件至 ${row.email}`}>{row.email}</a></TableCell><TableCell><a className="manage-detail-link" href={`/manage/applications/${row.id}`}>查看申请</a></TableCell></TableRow>)}</TableBody></Table></div>}
 <nav className="manage-pagination" aria-label="申请分页">{page>1&&<a href={`?page=${page-1}`}>上一页</a>}<span>第 {page} 页</span>{rows.results.length>50&&<a href={`?page=${page+1}`}>下一页</a>}</nav></>;
 }catch{return <section className="manage-notice"><h1>暂时无法读取申请</h1><p>请稍后刷新页面重试，已保存的申请不会因此丢失。</p></section>;}
}
