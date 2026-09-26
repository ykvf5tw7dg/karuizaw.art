import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync,existsSync,writeFileSync,renameSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
const root=process.env.DATA_DIR||join(process.cwd(),'data');
let connection:DatabaseSync|undefined;
export function sqlite(){
 if(connection)return connection;
 mkdirSync(root,{recursive:true,mode:0o700});
 const db=new DatabaseSync(join(root,'karuizawa.sqlite'));
 db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS _app_migrations(name TEXT PRIMARY KEY,checksum TEXT NOT NULL);');
 for(const directory of ['drizzle','deploy/migrations']){
  const path=join(process.cwd(),directory);if(!existsSync(path))continue;
  for(const name of readdirSync(path).filter(n=>n.endsWith('.sql')).sort()){
   const key=directory+'/'+name,sql=readFileSync(join(path,name),'utf8'),checksum=createHash('sha256').update(sql).digest('hex');
   const prior=db.prepare('SELECT checksum FROM _app_migrations WHERE name=?').get(key);
   if(prior){if(prior.checksum!==checksum)throw new Error('Migration checksum mismatch');continue;}
   db.exec('BEGIN IMMEDIATE');try{db.exec(sql);db.prepare('INSERT INTO _app_migrations VALUES(?,?)').run(key,checksum);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');db.close();throw e;}
  }
 }
 connection=db;return db;
}
class Statement{
 constructor(private sql:string,private values:any[]=[]){ }
 bind(...values:any[]){return new Statement(this.sql,values);}
 rows(){return sqlite().prepare(this.sql).all(...this.values);}
 async first<T=Record<string,unknown>>(column?:string):Promise<T|null>{const row=sqlite().prepare(this.sql).get(...this.values);return (row?(column?row[column]:row):null) as T|null;}
 async all<T=Record<string,unknown>>(){return {results:this.rows() as T[],success:true,meta:{}};}
 async run(){const result=sqlite().prepare(this.sql).run(...this.values);return {results:[],success:true,meta:{changes:Number(result.changes)}};}
}
export const database={prepare:(sql:string)=>new Statement(sql),async batch<T>(statements:Statement[]){const db=sqlite();db.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>({results:s.rows() as T[],success:true,meta:{}}));db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}} as unknown as D1Database;
function objectPath(key:string){if(!/^applications\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/.test(key))throw new Error('Invalid object key');const base=resolve(root,'photos');const path=resolve(base,key);if(!path.startsWith(base+sep))throw new Error('Invalid object key');return path;}
export const bucket={async put(key:string,body:ReadableStream){const path=objectPath(key);mkdirSync(resolve(path,'..'),{recursive:true,mode:0o700});const bytes=Buffer.from(await new Response(body).arrayBuffer());const temp=path+'.'+randomUUID()+'.tmp';writeFileSync(temp,bytes,{mode:0o600});renameSync(temp,path);return {};},async get(key:string){const path=objectPath(key);if(!existsSync(path))return null;return {body:new Uint8Array(readFileSync(path))};}} as unknown as R2Bucket;
