import Home from './home';
import {listProfiles,publicProfile} from '@/lib/server/profiles';
import {localeFrom,isLocale} from '@/lib/locales';
import {translations} from '@/lib/translations';
import type {Metadata} from 'next';
type Props={searchParams:Promise<{lang?:string}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{const {lang}=await searchParams;const locale=localeFrom(lang);const t=(text:string)=>translations[locale]?.[text]??text;return {title:t('轻井泽国际禅修营'),description:t('在轻井泽的森林与四季之间，支持个人与团体禅修驻留，让阅读、绘画、书法、闻香、插花与品茶融入静心生活。')};}
export default async function Page({searchParams}:Props){const {lang}=await searchParams;return <Home spaces={listProfiles('space',true).map(publicProfile)} teachers={listProfiles('teacher',true).map(publicProfile)} initialLocale={localeFrom(lang)} explicitLocale={isLocale(lang)}/>;}
