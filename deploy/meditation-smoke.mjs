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
const common=()=>({id:randomUUID(),name:'Isolated meditation test',email:randomUUID()+'@example.invalid',locale:'zh-Hans',message:'Independent practice and quiet residency test',consent:true,website:''});
const personal={traditionText:"",...common(),type:'meditation',applicationMode:'individual',participants:1,location:'Tokyo',availability:'November, seven nights',spaceNeeds:'Quiet room and vegetarian meals'};
const group={...common(),type:'meditation',applicationMode:'group',participants:8,location:'Kyoto',availability:'December, three nights',spaceNeeds:'Eight beds and shared quiet room',organization:'Test group',leader:'Test facilitator',groupActivities:'Morning sitting and silent walking',traditions:['soto','other'],traditionOther:'Test tradition',traditionDetail:'Test lineage',budget:'JPY 6000 per person per night',traditionText:'My private practice tradition'};
const sponsor=(extra={})=>({...common(),type:'sponsor',organization:'Test partner',category:'物资与设备',portfolio:'example.invalid',supportPlan:'meditation',traditionScope:'selected',traditions:['rinzai','theravada'],...extra});
const submit=data=>req('/api/applications',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)});
const legacyGroup={...group,id:randomUUID(),email:randomUUID()+"@example.invalid",traditionText:undefined};
for(const payload of [personal,group,legacyGroup,sponsor({traditionText:"Supported practice in my own words"}),sponsor({traditionText:"",traditions:[]}),sponsor(),sponsor({supportPlan:'all',traditionScope:'all',traditions:[]}),sponsor({traditions:['other'],traditionOther:'Test supported tradition'}),sponsor({supportPlan:undefined,traditionScope:undefined,traditions:undefined})]){
 let response=await submit(payload);assert.equal(response.status,201,await response.clone().text());assert.equal((await response.json()).reference,'KAV-'+payload.id);
 response=await submit(payload);assert.equal(response.status,200);
 response=await submit({...payload,message:'Changed duplicate payload'});assert.equal(response.status,409);
 response=await req('/manage/applications/'+payload.id);assert.equal(response.status,307);
 response=await req('/manage/applications/'+payload.id,{headers:auth});assert.equal(response.status,200);const html=await response.text();
 if(payload===group){for(const text of ['Test group','Test facilitator','My private practice tradition','JPY 6000','8'])assert.ok(html.includes(text),text);}
 if(payload===legacyGroup){for(const text of ['日本曹洞宗','Test tradition','Test lineage'])assert.ok(html.includes(text),text);}
 if(payload===personal)assert.ok(html.includes('禅修驻留申请'));
 if(payload.traditionText)assert.ok(html.includes(payload.traditionText));
 if(payload.traditionScope==='all')assert.ok(html.includes('全部派别'));
 if(payload.type==='sponsor')assert.ok(html.includes('http://example.invalid'));
}
for(const payload of [
 {...personal,id:randomUUID(),traditionText:'x'.repeat(301)},
 {...group,id:randomUUID(),leader:''}, {...group,id:randomUUID(),participants:1},
 {...personal,id:randomUUID(),participants:2}, {...personal,id:randomUUID(),spaceNeeds:''},
 sponsor({traditions:[]}),sponsor({traditions:['other'],traditionOther:''}),
 sponsor({traditionScope:'all',traditions:['soto']}),sponsor({traditions:['unknown']}),sponsor({traditions:['soto','soto']})
])assert.equal((await submit(payload)).status,400);
console.log('PASS free-text individual/group/sponsor saves, blank and length validation, historical choice compatibility, admin details, duplicate and access protection');
