// Fixed Japan Standard Time (UTC+09:00); independent of the visitor timezone.
export function japanDayKey(now=new Date()):string {
 return new Date(now.getTime()+9*60*60*1000).toISOString().slice(0,10);
}
