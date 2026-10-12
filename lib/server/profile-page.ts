import {notFound} from 'next/navigation';
import {getProfile,publicProfile} from './profiles';
import {localeFrom} from '../locales';
import {localizedText} from '../profiles';
export function publishedProfile(id:string,kind:'space'|'teacher'){const p=getProfile(id,true);if(!p||p.kind!==kind)notFound();return publicProfile(p);}
export function profileMetadata(id:string,kind:'space'|'teacher',lang?:string){const p=publishedProfile(id,kind),locale=localeFrom(lang);return {title:localizedText(p.names,locale)+' | Karuizawa Zen & Meditation',description:localizedText(p.summary,locale)};}
