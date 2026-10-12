import {notFound} from 'next/navigation';
import {requireAdmin} from '@/lib/admin';
import {getProfile} from '@/lib/server/profiles';
import {AccessDenied} from '../../access-denied';
import {ProfileEditor} from '../profile-editor';
export const dynamic='force-dynamic';
export default async function EditProfile({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!await requireAdmin(`/manage/profiles/${id}`))return <AccessDenied/>;const profile=getProfile(id);if(!profile)notFound();return <ProfileEditor initial={profile}/>;}
