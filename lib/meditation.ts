export const traditionIds = ['chinese','soto','rinzai','obaku','theravada','tibetan','nonsectarian','other'] as const;
export type TraditionId = typeof traditionIds[number];
export const traditionNames: Record<TraditionId,string> = {chinese:'汉传佛教',soto:'日本曹洞宗',rinzai:'日本临济宗',obaku:'日本黄檗宗',theravada:'南传佛教',tibetan:'藏传佛教',nonsectarian:'不限定宗派／静心实践',other:'其他'};
export const supportPlanNames = {artist:'艺术家与艺术活动',meditation:'禅修与静心驻留',all:'全部计划'} as const;
export function displayTraditions(data:Record<string,unknown>){
 if(typeof data.traditionText==='string')return data.traditionText;
 if(data.traditionScope==='all')return '全部派别';
 const names=Array.isArray(data.traditions)?data.traditions.filter((id):id is TraditionId=>typeof id==='string'&&id in traditionNames).map(id=>traditionNames[id]):[];
 return names.join('、');
}
