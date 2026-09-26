import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
const [source,destination]=process.argv.slice(2);
const data=JSON.parse(readFileSync(source,'utf8'));
const db=new DatabaseSync(destination);
db.exec('PRAGMA busy_timeout=5000; BEGIN IMMEDIATE');
try {
 for(const table of ['applications','application_notifications','site_counters']) {
  const columns=new Set(db.prepare(`PRAGMA table_info(${table})`).all().map(r=>r.name));
  for(const row of data[table]||[]) {
   const keys=Object.keys(row);if(keys.some(k=>!columns.has(k)))throw new Error('Unknown columns');
   let sql=`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`;
   sql+=table==='site_counters'?' ON CONFLICT(name) DO UPDATE SET total=MAX(total,excluded.total)':' ON CONFLICT DO NOTHING';
   db.prepare(sql).run(...keys.map(k=>row[k]));
  }
 }
 db.exec('COMMIT');
} catch(e){db.exec('ROLLBACK');throw e;}
for(const table of ['applications','application_notifications','site_counters'])console.log(table,db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n);
db.close();
