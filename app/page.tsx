import Home from './home';
import {localeFrom,isLocale} from '@/lib/locales';
import {translations} from '@/lib/translations';
import type {Metadata} from 'next';
type Props={searchParams:Promise<{lang?:string}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{const {lang}=await searchParams;const locale=localeFrom(lang);const t=(text:string)=>translations[locale]?.[text]??text;return {title:t('轻井泽国际艺术村'),description:t('首批计划招募100位各类艺术家，年度驻留目标为30–50位。欢迎介绍你的创作实践。')};}
export default async function Page({searchParams}:Props){const {lang}=await searchParams;return <Home initialLocale={localeFrom(lang)} explicitLocale={isLocale(lang)}/>;}
