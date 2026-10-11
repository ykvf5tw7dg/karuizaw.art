"use client";
import {useLanguage,LanguageSwitcher,LanguageProvider} from './language';
import type {Locale} from '@/lib/locales';
import {useEffect,useState} from 'react';
import {FooterUtilities} from './footer-utilities';
import {SeasonalHero} from './seasonal-hero';
import {Button} from '@/components/ui/button';
import {ApplicationDialog,type ApplicationKind} from './application-dialog';
import {organizationName,centerEnglish} from '@/lib/retreat';
const experiences=[
 {key:'incense',title:'闻香与香道',text:'在一缕香气中，练习感知与专注。',alt:'老师与参与者围坐木桌闻香，AI 概念图'},
 {key:'flowers',title:'插花与花道',text:'以当季枝叶，感受季节与留白。',alt:'老师带领参与者用当季枝叶插花，AI 概念图'},
 {key:'tea',title:'品茶与茶道',text:'从泡茶到品茗，将注意力放回眼前。',alt:'老师与小团体在森林窗边品茶，AI 概念图'},
 {key:'writing',title:'阅读、书法与写作',text:'在阅读与书写中，整理思绪，安静表达。',alt:'参与者在木桌旁练习书法与写作，AI 概念图'},
 {key:'photography-male',title:'森林漫步与摄影',text:'放慢脚步，用镜头观察自然的细节。',alt:'男士摄影师在森林步道使用专业相机与三脚架，AI 概念图'}
];
const navigation=[['#about','关于计划'],['#meditation-plan','禅修与驻留'],['#programs','静心体验'],['#center','关于我们'],['#participate','参与计划']];
export default function Home({initialLocale,explicitLocale}:{initialLocale:Locale;explicitLocale:boolean}){return <LanguageProvider initialLocale={initialLocale} explicitLocale={explicitLocale}><HomeContent/></LanguageProvider>;}
function HomeContent(){
 const {t}=useLanguage();
 const [menu,setMenu]=useState(false);
 const [kind,setKind]=useState<ApplicationKind|null>(null);
 const [initialMode,setInitialMode]=useState<'individual'|'group'>('individual');
 const [formKey,setFormKey]=useState(0);
 function apply(next:ApplicationKind,mode:'individual'|'group'='individual'){setInitialMode(mode);setFormKey(k=>k+1);setKind(next);}
 useEffect(()=>{
  const modelContext=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
  if(!modelContext?.registerTool)return;
  const lifecycle=new AbortController();
  Promise.resolve(modelContext.registerTool({name:'start_retreat_application',title:t('打开禅修营意向表'),description:t('打开禅修、老师合作或空间意向表；不会提交或保存个人资料。'),inputSchema:{type:'object',properties:{type:{type:'string',enum:['meditation','teacher','space']}},required:['type'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input:unknown)=>{const type=(input as {type?:string})?.type;if(!['meditation','teacher','space'].includes(type??''))throw new Error(t('申请类型无效'));apply(type as ApplicationKind);await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));return {opened:true,type,submitted:false};}},{signal:lifecycle.signal})).catch(()=>{});
  return()=>lifecycle.abort();
 },[t]);
 return <>
 <a className="skip" href="#main">{t('跳至正文')}</a>
 <header className="site-header">
  <a className="brand" href="#top" aria-label={t('轻井泽国际禅修营首页')}><span className="brand-mark" aria-hidden="true">K<span>／</span></span><span><strong>{t('轻井泽国际禅修营')}</strong><small>KARUIZAWA · ZEN & MEDITATION</small></span></a>
  <nav aria-label={t('主导航')}>{navigation.map(([href,label])=><a key={href} href={href} className={href==='#participate'?'nav-visit':undefined}>{t(label)}{href==='#participate'&&<span aria-hidden="true">↗</span>}</a>)}</nav>
  <LanguageSwitcher/>
  <button className="menu-toggle" aria-label={menu?t('关闭导航'):t('打开导航')} aria-expanded={menu} aria-controls="mobile-nav" onClick={()=>setMenu(!menu)}>{t('菜单')}<span aria-hidden="true">{menu?'×':'☰'}</span></button>
  <nav id="mobile-nav" className="mobile-nav" aria-label={t('移动端导航')} hidden={!menu} onClick={()=>setMenu(false)}>{navigation.map(([href,label])=><a href={href} key={href}>{t(label)}</a>)}</nav>
 </header>
 <main id="main">
  <SeasonalHero onApply={apply}/>
  <section className="about section-wrap" id="about">
   <div className="section-label"><span>01 / OUR VISION</span><span>{t('关于计划')}</span></div>
   <div className="about-content"><h2><span className="heading-phrase">{t('在轻井泽，')}</span><span className="heading-phrase">{t('留一段时间静下来。')}</span></h2><div className="about-copy"><p>{t('在森林与四季之间，安住身心。我们计划连接轻井泽的别墅、露营地与安静空间，支持个人自主实践及团体自带带领者的禅修与静心驻留。')}</p><p>{t('静心可以融入日常：静坐、阅读、书法、写作、绘画、摄影、闻香、插花、品茶与轻音乐，都是感受专注与从容的方式。艺术家及不同背景的参与者均可登记意向。')}</p></div></div>
   <div className="retreat-principles"><div><span>WEEKDAY STAYS</span><h3>{t('平日与淡季')}</h3><p>{t('协调适合安静停留的档期与住宿条件。')}</p></div><div><span>YOUR OWN PACE</span><h3>{t('个人与团体')}</h3><p>{t('自主实践，或与自带带领者的同伴同行。')}</p></div><div><span>MINDFUL EVERYDAY</span><h3>{t('文化与日常')}</h3><p>{t('让自然、艺术与生活体验融入静心时光。')}</p></div></div>
  </section>
  <section className="residency-section section-wrap" id="meditation-plan">
   <div className="section-label"><span>02 / STAY & PRACTICE</span><span>{t('禅修与驻留')}</span></div>
   <div className="section-heading"><h2>{t('按自己的节奏，安静停留。')}</h2><p>{t('从个人自主实践到团体共修，协调适合的住宿与活动空间。')}</p></div>
   <div className="practice-gallery"><figure><img src="/residency/personal-autumn.webp" alt={t('女性在秋日别墅内静心禅修，AI 概念图')} width={1536} height={1024} loading="lazy" decoding="async"/><figcaption><strong>{t('个人静心')}</strong><span>{t('为静坐、阅读与轻量创作，留出属于自己的时间。')}</span><button className="text-interest" onClick={()=>apply('meditation','individual')}>{t('登记个人意向')} ↗</button></figcaption></figure><figure><img src="/residency/group-winter.webp" alt={t('团体在冬日别墅内共同禅修，AI 概念图')} width={1774} height={887} loading="lazy" decoding="async"/><figcaption><strong>{t('团体同行')}</strong><span>{t('团体自带带领者，可沟通静坐、文化体验及共同活动安排。')}</span><button className="text-interest" onClick={()=>apply('meditation','group')}>{t('登记团体意向')} ↗</button></figcaption></figure></div>
   <p className="quiet-note retreat-terms">{t('目前接受筹备期意向登记。住宿档期、支持条件、活动内容与费用，均以进一步沟通确认的方案为准。')}</p>
   <p className="practice-image-note">{t('AI 概念意境图，非实际项目场地实拍。')}</p>
  </section>
  <section className="programs section-wrap" id="programs">
   <div className="section-label"><span>03 / MINDFUL EXPERIENCES</span><span>{t('静心体验')}</span></div>
   <div className="section-heading"><h2>{t('静心，也在日常之间。')}</h2><p>{t('从一段静坐到一杯茶，从一枝花到一笔色彩，让注意力回到眼前。')}</p></div>
   <div className="experience-gallery">{experiences.map(item=><figure key={item.key}><img src={`/experiences/${item.key}.webp`} alt={t(item.alt)} width={1536} height={1024} loading="lazy" decoding="async"/><figcaption><h3>{t(item.title)}</h3><p>{t(item.text)}</p></figcaption></figure>)}</div>
   <div className="creative-note"><figure><img src="/experiences/stream-guqin.webp" alt={t('男士在林间溪边安静弹奏古琴，AI 概念图')} width={1536} height={1024} loading="lazy" decoding="async"/></figure><div className="creative-copy"><span className="eyebrow">ART IN DAILY LIFE</span><h3>{t('绘画与轻音乐')}</h3><p>{t('在静心时光中加入素描、水彩或轻音乐练习。创作以适合住宿空间、易清洁的方式开展；音乐活动按场地与其他住客的作息协调。')}</p></div></div>
   <p className="practice-image-note">{t('体验内容可根据需求、场地条件与带领者安排协调，具体活动及费用以确认方案为准。')}</p><p className="practice-image-note">{t('AI 概念意境图，非实际项目场地实拍。')}</p>
  </section>
  <section className="invitation section-wrap" id="participate">
   <div className="section-label"><span>04 / TAKE PART</span><span>{t('参与计划')}</span></div>
   <div className="section-heading"><h2><span className="heading-phrase">{t('带着你的实践、经验，')}</span><span className="heading-phrase">{t('或一处安静的空间。')}</span></h2><p>{t('欢迎参与者、老师与空间伙伴，共同创造静心停留的可能。')}</p></div>
   <div className="join-grid">
    <article className="join-card featured"><span className="join-kicker">FOR PARTICIPANTS</span><div className="join-word">STILLNESS<span>{t('为安静与专注留出时间')}</span></div><h3>{t('个人与团体禅修驻留')}</h3><p>{t('欢迎个人自主实践及团体自带带领者，也欢迎希望静心休整的艺术家与创作者。填写时间、人数与体验兴趣，了解平日及淡季参与条件。')}</p><Button className="join-button" onClick={()=>apply('meditation')}>{t('登记禅修意向')}<span aria-hidden="true">↗</span></Button></article>
    <article className="join-card"><span className="join-kicker">FOR TEACHERS</span><div className="join-word">SHARE<span>{t('以经验陪伴专注的时光')}</span></div><h3>{t('禅修与文化体验老师招募')}</h3><p>{t('欢迎禅修、花道、茶道、香道、书法、绘画、写作、摄影及音乐等领域的老师，登记短期带领、主题活动或长期合作意向。')}</p><Button className="join-button" onClick={()=>apply('teacher')}>{t('登记老师合作意向')}<span aria-hidden="true">↗</span></Button></article>
    <article className="join-card"><span className="join-kicker">FOR SPACES</span><div className="join-word">SPACE<span>{t('让平日空间迎来安静停留')}</span></div><h3>{t('别墅与营地空间合作')}</h3><p>{t('欢迎提供平日及淡季可用的别墅、露营地和安静活动空间，沟通适合人数、设施与使用安排。')}</p><p className="space-preparation">{t('需提供空间地址、外观及内部设施照片，图片合计不超过30MB。')}</p><Button className="join-button" onClick={()=>apply('space')}>{t('登记空间意向')}<span aria-hidden="true">↗</span></Button></article>
   </div><p className="join-note">{t('提交登记不产生付款义务，也不代表参与确认、老师聘任或空间合作成立。具体条件另行协商。')}</p>
  </section>
  <section className="center section-wrap" id="center">
   <div className="section-label"><span>05 / OUR CENTER</span><span>{t('关于我们')}</span></div>
   <div className="center-grid"><div><p className="eyebrow">{centerEnglish}</p><h2><span className="heading-phrase">{t('以自然安住身心，')}</span><span className="heading-phrase">{t('以文化连接彼此。')}</span></h2></div><div className="center-copy"><h3>{organizationName}</h3><p>{t('中文名称：轻井泽国际禅修营。中心拟在日本设立为一般社团法人，以轻井泽为基地，支持禅修与静心驻留、文化体验及国际交流。')}</p><p>{t('我们计划连接参与者、老师与当地空间，让阅读、书法、写作、绘画、摄影、闻香、插花、品茶与音乐融入静心生活，逐步建立开放、可持续的驻留与交流平台。')}</p><p>{t('目前，中心正处于筹备阶段，组织治理与具体事业安排将以正式设立后的章程为准。')}</p></div></div>
  </section>
  <section className="closing"><span>PAUSE. STAY. CONNECT.</span><p>{t('下一段静心时光，从这里开始。')}</p><a href="#participate">{t('探索参与方式')}<span aria-hidden="true">↗</span></a></section>
 </main>
 <footer><div className="footer-top"><a className="footer-name" href="#top">{t('轻井泽国际禅修营')}</a><p><span className="copy-line">{t('日本 · 轻井泽')}</span><span className="copy-line">{t('禅修驻留 / 静心体验 / 国际交流')}</span></p><a href="#top">{t('回到顶部 ↑')}</a></div><div className="footer-bottom"><span>© 2026 {organizationName} · {t('版权所有')}</span><span>{t('网站图片为概念意境图，非实际项目场地实拍。')}</span></div><FooterUtilities/></footer>
 <ApplicationDialog key={formKey} initialMode={initialMode} kind={kind} onClose={()=>setKind(null)}/>
 </>;
}
