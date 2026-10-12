import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const base=process.env.TEST_URL;
if(!base?.startsWith('http://127.0.0.1:'))throw new Error('Use isolated local server only');
const request=(path,options={})=>fetch(base+path,{redirect:'manual',...options});
const access=readFileSync('deploy/private/admin-access.txt','utf8'),email=access.match(/邮箱：(.+)/)[1],password=access.match(/密码：(.+)/)[1];
const login=await request('/api/auth/login',{method:'POST',headers:{origin:base},body:new URLSearchParams({email,password})});assert.equal(login.status,303);const cookie=login.headers.get('set-cookie').split(';')[0];
const headers={origin:base,cookie,'content-type':'application/json'};
const send=(path,body,method='POST',h=headers)=>request(path,{method,headers:h,body:JSON.stringify(body)});
for(const path of ['/manage/profiles','/manage/profiles/komorebi-woods'])assert.equal((await request(path)).status,307);
assert.equal((await send('/api/manage/profiles',{kind:'teacher'},'POST',{origin:base,'content-type':'application/json'})).status,401);
assert.equal((await send('/api/manage/profiles',{kind:'teacher'},'POST',{...headers,origin:'https://example.invalid'})).status,403);
assert.equal((await send('/api/manage/profiles',{kind:'teacher'},'POST',{cookie,'content-type':'application/json'})).status,403);
for(const lang of ['zh-Hans','zh-Hant','ja','en']){
 const r=await request('/?lang='+lang);assert.equal(r.status,200);const html=await r.text();assert.ok(html.includes('Rosewood Inn'));assert.ok(html.includes('/spaces/forest-private-camp'));assert.ok(!html.includes('人数冲突：页面'));
 for(const id of ['komorebi-woods','rosewood-inn','forest-private-camp']){const detail=await request(`/spaces/${id}?lang=${lang}`);assert.equal(detail.status,200);const text=await detail.text();assert.equal([...new Set([...text.matchAll(/\/partners\/spaces\/[a-z-]+\/[a-z-]+\.webp/g)].map(x=>x[0]))].length,{'komorebi-woods':20,'rosewood-inn':20,'forest-private-camp':18}[id]);}
}
const before=await request('/manage/profiles',{headers:{cookie}});assert.equal(before.status,200);assert.ok((await before.text()).includes('Rosewood Inn'));
let r=await send('/api/manage/profiles',{kind:'teacher'});assert.equal(r.status,201);let p=(await r.json()).profile;
const payloadOf=p=>{const {id,revision,updatedAt,...payload}=p;return payload;};
assert.equal((await request('/teachers/'+p.id)).status,404);
const forged=payloadOf(p);forged.photos=[{id:'forged',src:'/partners/spaces/komorebi-woods/exterior.webp',alt:{'zh-Hans':'外观','zh-Hant':'外觀',ja:'外観',en:'Exterior'}}];assert.equal((await send('/api/manage/profiles/'+p.id,{revision:p.revision,payload:forged},'PUT')).status,400);
const invalid=payloadOf(p);invalid.sourceUrl='javascript:alert(1)';assert.equal((await send('/api/manage/profiles/'+p.id,{revision:p.revision,payload:invalid},'PUT')).status,400);
const raw=payloadOf(p);raw.status='public';assert.equal((await send('/api/manage/profiles/'+p.id,{revision:p.revision,payload:raw},'PUT')).status,400);
const fake=new FormData();fake.append('revision',String(p.revision));fake.append('photo',new Blob(['not an image'],{type:'image/jpeg'}),'fake.jpg');assert.equal((await request(`/api/manage/profiles/${p.id}/photos`,{method:'POST',headers:{origin:base,cookie},body:fake})).status,400);
const photo=new FormData();photo.append('revision',String(p.revision));photo.append('photo',new Blob([readFileSync('content/partner-spaces/drafts/komorebi-woods/photos/exterior.jpeg')],{type:'image/jpeg'}),'teacher-test.jpg');
r=await request(`/api/manage/profiles/${p.id}/photos`,{method:'POST',headers:{origin:base,cookie},body:photo});assert.equal(r.status,201,await r.clone().text());p=(await r.json()).profile;
const media=p.photos[0].src;assert.equal((await request(media)).status,404);const privatePhoto=await request(media,{headers:{cookie}});assert.equal(privatePhoto.status,200);assert.equal(privatePhoto.headers.get('content-type'),'image/webp');
let payload=payloadOf(p);const marker='ISOLATED_TEACHER_'+randomUUID();for(const l of ['zh-Hans','zh-Hant','ja','en']){payload.names[l]=marker;payload.summary[l]='Facilitation profile used only for isolated testing';payload.details[l]='Verified test biography';payload.features[l]='Tea\nMeditation';payload.photos[0].alt[l]='Isolated test picture';}
payload.languages=['ja','en'];payload.teachingModes=['individual','group'];payload.status='public';payload.internalNotes='PRIVATE_NOTES_'+randomUUID();const secretNote=payload.internalNotes;
r=await send('/api/manage/profiles/'+p.id,{revision:p.revision,payload},'PUT');assert.equal(r.status,200,await r.clone().text());const previousRevision=p.revision;p=(await r.json()).profile;
assert.equal((await send('/api/manage/profiles/'+p.id,{revision:previousRevision,payload},'PUT')).status,409);
assert.equal((await request(media)).status,200);r=await request('/teachers/'+p.id+'?lang=en');assert.equal(r.status,200);assert.ok((await r.text()).includes(marker));
let publicHtml=await (await request('/?lang=en')).text();assert.ok(publicHtml.includes(marker));assert.ok(!publicHtml.includes(secretNote));assert.ok(!(await (await request('/teachers/'+p.id)).text()).includes(secretNote));
const common=()=>({id:randomUUID(),type:'meditation',name:'Isolated partner test',email:randomUUID()+'@example.invalid',message:'Quiet retreat test in isolated database',consent:true,website:'',locale:'zh-Hans',applicationMode:'individual',location:'Tokyo',participants:1,availability:'Weekdays in November',spaceNeeds:'Quiet room',traditionText:''});
const application={...common(),preferredSpace:'komorebi-woods',preferredTeacher:p.id};
r=await send('/api/applications',application);assert.equal(r.status,201,await r.clone().text());assert.equal((await send('/api/applications',application)).status,200);assert.equal((await send('/api/applications',{...application,message:'Conflicting resubmission'})).status,409);
r=await request('/manage/applications/'+application.id,{headers:{cookie}});const adminHtml=await r.text();assert.equal(r.status,200);assert.ok(adminHtml.includes('意向空间'));assert.ok(adminHtml.includes('KOMOREBI WOODS'));assert.ok(adminHtml.includes(marker));
assert.equal((await send('/api/applications',common())).status,201);
assert.equal((await send('/api/applications',{...common(),preferredSpace:'missing'})).status,400);
payload=payloadOf(p);payload.status='draft';r=await send('/api/manage/profiles/'+p.id,{revision:p.revision,payload},'PUT');assert.equal(r.status,200);p=(await r.json()).profile;
assert.equal((await request('/teachers/'+p.id)).status,404);assert.equal((await request(media)).status,404);publicHtml=await (await request('/?lang=en')).text();assert.ok(!publicHtml.includes(marker));assert.equal((await send('/api/applications',{...common(),preferredTeacher:p.id})).status,400);
assert.equal((await send('/api/applications',application)).status,200);
console.log('PASS: three spaces × four languages, teacher publish/hide, private upload, CSRF/auth, revision conflict, private notes, invalid photo/URL/publication checks, application preferences, duplicate protection and historical no-preference submissions');
