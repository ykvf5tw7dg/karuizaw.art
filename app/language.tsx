"use client";
import {createContext,useContext,useEffect,useCallback,useState,type ReactNode} from 'react';
import {Languages} from 'lucide-react';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {translations} from '@/lib/translations';
import {locales,languageNames,isLocale,type Locale} from '@/lib/locales';
type LanguageContext={locale:Locale;t:(text:string)=>string;changeLanguage:(locale:Locale)=>void};
const Context=createContext<LanguageContext>({locale:'zh-Hans',t:text=>text,changeLanguage:()=>{}});
export function LanguageProvider({initialLocale,explicitLocale,children}:{initialLocale:Locale;explicitLocale:boolean;children:ReactNode}){
 const [locale,setLocale]=useState(initialLocale);
 const changeLanguage=useCallback((next:Locale)=>{setLocale(next);try{localStorage.setItem('kav-language',next);}catch{}const url=new URL(window.location.href);url.searchParams.set('lang',next);window.history.replaceState(null,'',url.pathname+url.search+url.hash);},[]);
 useEffect(()=>{if(!explicitLocale){try{const saved=localStorage.getItem('kav-language');if(isLocale(saved))changeLanguage(saved);}catch{}}},[explicitLocale,changeLanguage]);
 useEffect(()=>{function sync(){const next=new URL(window.location.href).searchParams.get('lang');setLocale(isLocale(next)?next:'zh-Hans');}window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[]);
 const t=useCallback((text:string)=>translations[locale]?.[text]??text,[locale]);
 useEffect(()=>{document.documentElement.lang=locale;document.title=t('轻井泽国际艺术村');},[locale,t]);
 return <Context.Provider value={{locale,t,changeLanguage}}>{children}</Context.Provider>;
}
export function useLanguage(){return useContext(Context);}
export function LanguageSwitcher(){const {locale,t,changeLanguage}=useLanguage();return <div className="language-switcher"><Languages size={17} aria-hidden="true"/><Select value={locale} onValueChange={value=>{if(isLocale(value))changeLanguage(value);}}><SelectTrigger aria-label={t('语言')} className="language-trigger"><SelectValue/></SelectTrigger><SelectContent>{locales.map(lang=><SelectItem key={lang} value={lang}><span lang={lang}>{languageNames[lang]}</span></SelectItem>)}</SelectContent></Select></div>;}
