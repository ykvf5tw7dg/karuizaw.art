import { applicationDb } from '@/db/applications';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if((origin&&origin!==new URL(request.url).origin)||request.headers.get('x-visit-source')!=='homepage')return Response.json({error:'Forbidden'},{status:403,headers});
 try{
  // One atomic increment prevents concurrent visits from overwriting each other.
  const row=await applicationDb().prepare("INSERT INTO site_counters (name,total) VALUES ('homepage',1) ON CONFLICT(name) DO UPDATE SET total=total+1 RETURNING total").first<{total:number}>();
  if(!row)throw new Error('counter unavailable');
  return Response.json({total:row.total},{headers});
 }catch{console.error('visit_counter_unavailable');return Response.json({error:'Unavailable'},{status:503,headers});}
}
