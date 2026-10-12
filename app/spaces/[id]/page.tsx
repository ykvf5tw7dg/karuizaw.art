import {listProfiles} from '@/lib/server/profiles';
import ProfileDetail from '@/app/profile-detail';
import {publishedProfile,profileMetadata} from '@/lib/server/profile-page';
import {localeFrom,isLocale} from '@/lib/locales';
export const dynamic='force-dynamic';
type Props={params:Promise<{id:string}>;searchParams:Promise<{lang?:string}>};
export async function generateMetadata({params,searchParams}:Props){const {id}=await params;const {lang}=await searchParams;return profileMetadata(id,"space",lang);}
export default async function Page({params,searchParams}:Props){const {id}=await params;const {lang}=await searchParams;return <ProfileDetail spaceOptions={listProfiles('space',true).map(({id,names})=>({id,names}))} teacherOptions={listProfiles('teacher',true).map(({id,names})=>({id,names}))} profile={publishedProfile(id,"space")} initialLocale={localeFrom(lang)} explicitLocale={isLocale(lang)}/>;}
