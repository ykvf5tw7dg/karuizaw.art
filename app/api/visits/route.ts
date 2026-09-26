import { japanDayKey } from '@/lib/visits';
import { applicationDb } from '@/db/applications';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if((origin&&origin!==new URL(process.env.SITE_ORIGIN||request.url).origin)||request.headers.get('x-visit-source')!=='homepage')return Response.json({error:'Forbidden'},{status:403,headers});
 try{
  const db=applicationDb();
  const day=japanDayKey();
  // D1 batch commits both increments as one transaction; keep the existing total.
  const increment="INSERT INTO site_counters (name,total) VALUES (?,1) ON CONFLICT(name) DO UPDATE SET total=total+1 RETURNING total";
  const results=await db.batch<{total:number}>([
   db.prepare(increment).bind('homepage'),
   db.prepare(increment).bind(`homepage:${day}`)
  ]);
  const total=results[0]?.results[0]?.total;
  const today=results[1]?.results[0]?.total;
  if(typeof total!=='number'||typeof today!=='number')throw new Error('counter unavailable');
  return Response.json({today,total,day},{headers});
 }catch{console.error('visit_counter_unavailable');return Response.json({error:'Unavailable'},{status:503,headers});}
}
