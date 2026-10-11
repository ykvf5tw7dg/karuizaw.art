export const organizationName = '一般社団法人 軽井沢国際禅・瞑想センター（筹）';
export const centerEnglish = 'Karuizawa International Zen Meditation Center';
export const experienceNames = {
 sitting:'静坐',walking:'森林漫步',reading:'阅读',writing:'写作',calligraphy:'书法',painting:'绘画',photography:'摄影',incense:'闻香与香道',flowers:'插花与花道',tea:'品茶与茶道',music:'轻音乐',other:'其他'
} as const;
export const experienceIds = Object.keys(experienceNames) as [keyof typeof experienceNames, ...(keyof typeof experienceNames)[]];
export const teacherNames = {
 meditation:'禅修与静心',incense:'闻香与香道',flowers:'插花与花道',tea:'品茶与茶道',calligraphy:'书法',painting:'绘画',writing:'写作',photography:'摄影',music:'音乐',other:'其他'
} as const;
export const teacherIds = Object.keys(teacherNames) as [keyof typeof teacherNames, ...(keyof typeof teacherNames)[]];
export function displaySelections(value:unknown,names:Record<string,string>){return Array.isArray(value)?value.filter((v):v is string=>typeof v==='string').map(v=>names[v]??v).join('、'):'';}
