export const locales=['zh-Hans','ja','en','zh-Hant'] as const;
export type Locale=typeof locales[number];
export const languageNames:Record<Locale,string>={'zh-Hans':'简体中文',ja:'日本語',en:'English','zh-Hant':'繁體中文'};
export function isLocale(value:unknown):value is Locale{return typeof value==='string'&&(locales as readonly string[]).includes(value);}
export function localeFrom(value:unknown):Locale{return isLocale(value)?value:'zh-Hans';}

// Match browser language preferences in order; explicit script beats region.
export function systemLocale(languages:readonly string[]):Locale {
 for(const language of languages){
  const parts=language.toLowerCase().replaceAll('_','-').split('-');
  if(parts[0]==='ja')return 'ja';
  if(parts[0]==='en')return 'en';
  if(parts[0]==='zh'){
   if(parts.includes('hant'))return 'zh-Hant';
   if(parts.includes('hans'))return 'zh-Hans';
   return parts.some(part=>['tw','hk','mo'].includes(part))?'zh-Hant':'zh-Hans';
  }
 }
 return 'en';
}
export function preferredLocale(explicit:unknown,saved:unknown,languages:readonly string[]):Locale {
 return isLocale(explicit)?explicit:isLocale(saved)?saved:systemLocale(languages);
}
