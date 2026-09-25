export const locales=['zh-Hans','ja','en','zh-Hant'] as const;
export type Locale=typeof locales[number];
export const languageNames:Record<Locale,string>={'zh-Hans':'简体中文',ja:'日本語',en:'English','zh-Hant':'繁體中文'};
export function isLocale(value:unknown):value is Locale{return typeof value==='string'&&(locales as readonly string[]).includes(value);}
export function localeFrom(value:unknown):Locale{return isLocale(value)?value:'zh-Hans';}
