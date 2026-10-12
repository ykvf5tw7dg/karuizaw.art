import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const base=process.env.TEST_URL;
if(!base?.startsWith('http://127.0.0.1:'))throw new Error('Isolated localhost only');
const origin='https://www.karuizawa.art',req=(path,o={})=>fetch(base+path,{redirect:'manual',...o});
const access=readFileSync('deploy/private/admin-access.txt','utf8');
let r=await req('/api/auth/login',{method:'POST',headers:{origin},body:new URLSearchParams({email:access.match(/邮箱：(.+)/)[1],password:access.match(/密码：(.+)/)[1]})});assert.equal(r.status,303);const cookie=r.headers.get('set-cookie').split(';')[0],headers={origin,cookie,'content-type':'application/json'};
const bytes=readFileSync('public/partners/spaces/komorebi-woods/living-room.webp');
const id=randomUUID(),payload={id,type:'teacher',locale:'zh-Hans',name:'Isolated QA facilitator',email:`teacher-${id}@example.invalid`,message:'Only isolated verification',consent:true,website:'',location:'Test',subjects:['tea'],experience:'Isolated teaching experience',languages:'Chinese',availability:'Test',spaceNeeds:'Test room',portfolio:'',socialAccounts:'Instagram: @test\nhttps://example.invalid/profile'};
function form(data,n=6,category){const f=new FormData();f.append('application',JSON.stringify(data));for(let i=0;i<n;i++)f.append(category??['portrait','work','teaching'][i%3],new Blob([bytes],{type:'image/webp'}),`photo${i}.webp`);return f;}
r=await req('/api/applications',{method:'POST',headers:{origin},body:form(payload)});assert.equal(r.status,201,await r.clone().text());
assert.equal((await req('/api/applications',{method:'POST',headers:{origin},body:form(payload)})).status,200);
assert.equal((await req('/api/applications',{method:'POST',headers:{origin},body:form({...payload,socialAccounts:'changed'})})).status,409);
assert.equal((await req('/api/applications',{method:'POST',headers:{origin},body:form({...payload,id:randomUUID()},7)})).status,400);
assert.equal((await req('/api/applications',{method:'POST',headers:{origin},body:form({...payload,id:randomUUID()},1,'exterior')})).status,400);
assert.equal((await req('/api/applications',{method:'POST',headers:{origin},body:form({...payload,id:randomUUID()},1,'portrait-invalid')})).status,400);
assert.equal((await req('/api/applications',{method:'POST',headers:{origin:'https://evil.invalid'},body:form({...payload,id:randomUUID()})})).status,403);
assert.equal((await req('/api/applications',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({...payload,id:randomUUID(),socialAccounts:undefined})})).status,201);
let page=await req('/manage/applications/'+id,{headers:{cookie}});assert.equal(page.status,200);const html=await page.text();assert.ok(html.includes('@test')&&html.includes('个人照片')&&html.includes('工作场景')&&html.includes('授课与带领场景'));
for(let i=0;i<6;i++){assert.equal((await req(`/api/manage/applications/${id}/photos/${i}`)).status,401);r=await req(`/api/manage/applications/${id}/photos/${i}`,{headers:{cookie}});assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),bytes);}
r=await req('/api/manage/profiles',{method:'POST',headers,body:JSON.stringify({kind:'teacher'})});assert.equal(r.status,201);let p=(await r.json()).profile;
const upload=async(category)=>{const f=new FormData();f.append('photo',new Blob([bytes],{type:'image/webp'}),'test.webp');f.append('revision',String(p.revision));f.append('category',category);return req(`/api/manage/profiles/${p.id}/photos`,{method:'POST',headers:{origin,cookie},body:f});};
assert.equal((await upload('bedroom')).status,400);
for(let i=0;i<6;i++){r=await upload(['portrait','work','teaching'][i%3]);assert.equal(r.status,201);p=(await r.json()).profile;}
assert.equal((await upload('portrait')).status,400);assert.equal(p.photos.length,6);
const save=async(data)=>{const {id,revision,updatedAt,...payload}=data;return req('/api/manage/profiles/'+id,{method:'PUT',headers,body:JSON.stringify({revision,payload})});};
for(const lang of ['zh-Hans','zh-Hant','ja','en']){p.names[lang]='QA facilitator';p.summary[lang]='Only for local preview';for(const [i,x] of p.photos.entries())x.alt[lang]=['Portrait','Work','Teaching'][i%3]+' '+i;}
p.languages=['zh-Hans'];p.teachingModes=['individual'];p.status='public';p.socialLinks=[{label:'Instagram',url:'https://example.invalid/facilitator'}];
assert.equal((await save({...p,socialLinks:[{label:'Unsafe',url:'javascript:alert(1)'}]})).status,400);
assert.equal((await save({...p,socialLinks:[{label:'Unsafe',url:'https://user:secret@example.invalid/'}]})).status,400);
r=await save(p);assert.equal(r.status,200,await r.clone().text());p=(await r.json()).profile;
page=await req('/teachers/'+p.id+'?lang=en');assert.equal(page.status,200);assert.ok((await page.text()).includes('https://example.invalid/facilitator'));assert.equal((await req(p.photos[0].src)).status,200);
r=await req('/api/manage/profiles',{method:'POST',headers,body:JSON.stringify({kind:'teacher'})});let legacy=(await r.json()).profile;const legacyForm=new FormData();legacyForm.append('photo',new Blob([bytes],{type:'image/webp'}),'legacy.webp');legacyForm.append('revision',String(legacy.revision));r=await req(`/api/manage/profiles/${legacy.id}/photos`,{method:'POST',headers:{origin,cookie},body:legacyForm});assert.equal(r.status,201);legacy=(await r.json()).profile;const {category,...oldPhoto}=legacy.photos[0];assert.equal((await save({...legacy,photos:[oldPhoto]})).status,200);
writeFileSync('/tmp/karuizawa-teacher-six-qa-20261012/preview-id.txt',p.id);
console.log('PASS: six teacher application photos/categories, social accounts, duplicate protection, private admin reads, legacy photo-free request, www origin, CMS six/seventh limit, teacher-category validation, safe public social URL, legacy single photo');
