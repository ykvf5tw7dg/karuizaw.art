import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const base=process.env.TEST_URL;
if(!base||!base.startsWith('http://127.0.0.1:'))throw new Error('Use an isolated local test server');
const origin='https://karuizawa.art';
const req=(path,options={})=>fetch(base+path,{redirect:'manual',...options});
const access=readFileSync('deploy/private/admin-access.txt','utf8');
const email=access.match(/邮箱：(.+)/)[1],password=access.match(/密码：(.+)/)[1];
const login=await req('/api/auth/login',{method:'POST',headers:{origin},body:new URLSearchParams({email,password})});
assert.equal(login.status,303);
const auth={Cookie:login.headers.get('set-cookie').split(';')[0]};
const common=()=>({id:randomUUID(),name:'Isolated zen test',email:randomUUID()+'@example.invalid',locale:'zh-Hans',message:'A quiet retreat and cultural experience test',consent:true,website:''});
const teacher={...common(),type:'teacher',subjects:['meditation','calligraphy','tea','other'],subjectOther:'Reflective reading',experience:'Ten years of teaching and facilitation',languages:'Japanese and English',location:'Tokyo',availability:'Weekdays in November',participantsGuidance:'4 to 8 adults',spaceNeeds:'Quiet room, tables and tea utensils',cooperation:'Fees discussed per session',portfolio:'example.invalid',traditionText:'Personal practice description'};
const personal={...common(),type:'meditation',applicationMode:'individual',participants:1,location:'Tokyo',availability:'November, three nights',spaceNeeds:'Quiet room and drawing table',interests:['painting','calligraphy','writing','photography','incense','tea'],traditionText:''};
const group={...personal,...common(),applicationMode:'group',participants:6,organization:'Reading retreat',leader:'Group facilitator',groupActivities:'Morning sitting, tea and reading',interests:['reading','other'],interestOther:'Nature journaling'};
const submit=data=>req('/api/applications',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)});
for(const payload of [teacher,personal,group]){
 let r=await submit(payload);assert.equal(r.status,201,await r.clone().text());assert.equal((await r.json()).reference,'KAV-'+payload.id);
 r=await submit(payload);assert.equal(r.status,200);
 r=await submit({...payload,message:'Conflicting resubmission'});assert.equal(r.status,409);
 r=await req('/manage/applications/'+payload.id);assert.equal(r.status,307);
 r=await req('/manage/applications/'+payload.id,{headers:auth});assert.equal(r.status,200);const html=await r.text();
 const expected=payload===teacher?['老师合作申请','禅修与静心','书法','品茶与茶道','Reflective reading',teacher.experience,teacher.languages,teacher.availability,teacher.participantsGuidance,teacher.spaceNeeds,teacher.cooperation,teacher.traditionText,'http://example.invalid']:payload===group?['Reading retreat','Group facilitator','Nature journaling','阅读']:['绘画','摄影','闻香与香道','写作'];
 for(const text of expected)assert.ok(html.includes(text),text);
 assert.ok(html.includes('mailto:'));
}
for(const patch of [{subjects:[]},{subjects:['unknown']},{subjects:['tea','tea']},{subjectOther:''},{experience:''},{languages:''},{availability:''},{spaceNeeds:''},{traditionText:'x'.repeat(301)}])assert.equal((await submit({...teacher,id:randomUUID(),...patch})).status,400);
assert.equal((await submit({...personal,id:randomUUID(),interests:['unknown']})).status,400);
assert.equal((await submit({...personal,id:randomUUID(),interests:['tea','tea']})).status,400);
// Verify the expanded teacher payload can hold the documented field limits.
assert.equal((await submit({...teacher,id:randomUUID(),email:randomUUID()+'@example.invalid',experience:'字'.repeat(2000),message:'字'.repeat(2000),spaceNeeds:'字'.repeat(1000),cooperation:'字'.repeat(500)})).status,201);
for(const lang of ['zh-Hans','zh-Hant','ja','en']){
 const r=await req('/?lang='+lang);assert.equal(r.status,200);const html=await r.text();
 assert.ok(!html.includes('30–50'));assert.ok(!html.includes('首批艺术家招募计划'));
 assert.ok(!html.includes('FOR ARTISTS'));assert.ok(!html.includes('FOR PARTNERS'));
 assert.ok(html.includes('FOR TEACHERS'));assert.ok(html.includes('NATURE · STILLNESS · CONNECTION'));
 assert.ok(html.includes('/experiences/incense.webp'));
}
console.log('PASS teacher, individual and group saves; complete admin details; subject/other/limits validation; duplicate protection; private access; four-language public rebrand');
