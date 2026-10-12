import {randomUUID} from 'node:crypto';
import {adminJson} from '@/lib/admin';
import {blankProfile} from '@/lib/profiles';
import {createProfile,listProfiles} from '@/lib/server/profiles';
import {adminMutation,readBounded} from '@/lib/server/profile-request';
export const dynamic='force-dynamic';
export async function POST(request:Request){const denied=await adminMutation(request);if(denied)return denied;try{const body=JSON.parse((await readBounded(request,1024)).toString());if(body.kind!=='space'&&body.kind!=='teacher')return adminJson({error:'类型无效。'},400);if(listProfiles().length>=200)return adminJson({error:'资料数量已达上限。'},400);const p=createProfile(body.kind+'-'+randomUUID(),blankProfile(body.kind));return adminJson({profile:p},201);}catch{return adminJson({error:'暂时无法创建资料。'},400);}}
