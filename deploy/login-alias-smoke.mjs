import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=process.env.TEST_URL;
if(!base?.startsWith('http://127.0.0.1:'))throw new Error('Use isolated local server with SITE_ORIGIN=https://karuizawa.art');
const access=readFileSync('deploy/private/admin-access.txt','utf8');
const data={email:access.match(/邮箱：(.+)/)[1],password:access.match(/密码：(.+)/)[1],return_to:'/manage/profiles'};
for(const origin of ['https://karuizawa.art','https://www.karuizawa.art']){
 const r=await fetch(base+'/api/auth/login',{method:'POST',redirect:'manual',headers:{origin},body:new URLSearchParams(data)});
 assert.equal(r.status,303);assert.equal(r.headers.get('location'),origin+'/manage/profiles');const cookie=r.headers.get('set-cookie');assert.ok(cookie.includes('Secure')&&cookie.includes('HttpOnly')&&cookie.includes('SameSite=strict'));
 const editor=await fetch(base+'/manage/profiles/rosewood-inn',{redirect:'manual',headers:{cookie:cookie.split(';')[0]}});assert.equal(editor.status,200);const html=await editor.text();assert.ok(html.includes('空间实景照片（最多20张）'));assert.ok(html.includes('multiple'));assert.equal([...html.matchAll(/功能区分类/g)].length,20);
}
for(const origin of [undefined,'https://example.invalid','https://karuizawa.art.example.invalid','http://www.karuizawa.art']){
 const r=await fetch(base+'/api/auth/login',{method:'POST',redirect:'manual',headers:origin?{origin}:{},body:new URLSearchParams(data)});assert.equal(r.status,403);
}
console.log('PASS: both trusted HTTPS aliases log in and redirect on same host;20-photo editor renders; Secure/HttpOnly/Strict cookie retained; missing/untrusted/HTTP origins rejected');
