"use client";
import { useLanguage,LanguageSwitcher,LanguageProvider } from "./language";
import type { Locale } from "@/lib/locales";
import { useEffect, useState } from "react";
import { FooterUtilities } from "./footer-utilities";
import { SeasonalHero } from "./seasonal-hero";
import { Button } from "@/components/ui/button";
import { ApplicationDialog, type ApplicationKind } from "./application-dialog";
const programs = [
 {num:"01",en:"ARTIST RESIDENCY",title:"艺术家驻留",text:"将一段时间留给创作。计划为不同领域的艺术家连接驻留空间，支持独立创作、跨界交流与在地探索。",tags:"绘画 / 雕塑 / 影像 / 设计 / 更多领域"},
 {num:"02",en:"EXHIBITIONS & EXCHANGE",title:"展览与艺术交流",text:"让作品成为对话的起点。规划展览、开放工作室、艺术家分享与国际交流，让创作与更广泛的公众相遇。",tags:"开放工作室 / 策展 / 国际交流"},
 {num:"03",en:"ART & LEARNING",title:"艺术教育与体验",text:"让艺术融入生活。探索工作坊、艺术夏令营与跨文化学习，让不同年龄、不同背景的人参与创作。",tags:"艺术工作坊 / 夏令营 / 公众活动"},
];
export default function Home({initialLocale,explicitLocale}:{initialLocale:Locale;explicitLocale:boolean}){return <LanguageProvider initialLocale={initialLocale} explicitLocale={explicitLocale}><HomeContent/></LanguageProvider>;}
function HomeContent(){
 const {t,locale}=useLanguage();
 const [menu,setMenu]=useState(false);
 const [kind,setKind]=useState<ApplicationKind|null>(null);
 const [formKey,setFormKey]=useState(0);
 function apply(next:ApplicationKind){setFormKey(k=>k+1);setKind(next);}
 useEffect(()=>{
   const modelContext=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
   if(!modelContext?.registerTool)return;
   const lifecycle=new AbortController();
   Promise.resolve(modelContext.registerTool({name:"start_art_village_application",title:t("打开艺术村申请表"),description:t("按类型打开艺术家、禅修驻留、赞助合作或空间申请表；不会提交或保存个人资料。"),inputSchema:{type:"object",properties:{type:{type:"string",enum:["artist","sponsor","space","meditation"]}},required:["type"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input:unknown)=>{const type=(input as {type?:string})?.type;if(!["artist","sponsor","space","meditation"].includes(type??""))throw new Error(t("申请类型无效"));apply(type as ApplicationKind);await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));return {opened:true,type,submitted:false};}},{signal:lifecycle.signal})).catch(()=>{});
   return ()=>lifecycle.abort();
 },[t]);
 return <>
 <a className="skip" href="#main">{t("跳至正文")}</a>
 <header className="site-header">
 <a className="brand" href="#top" aria-label={t("轻井泽国际艺术村首页")}><span className="brand-mark" aria-hidden="true">K<span>／</span></span><span><strong>{t("轻井泽国际艺术村")}</strong><small>KARUIZAWA INTERNATIONAL ART VILLAGE</small></span></a>
 <nav aria-label={t("主导航")}><a href="#about">{t("关于艺术村")}</a><a href="#programs">{t("艺术计划")}</a><a href="#center">{t("关于我们")}</a><a className="nav-visit" href="#participate">{t("参与共建")}<span aria-hidden="true">↗</span></a></nav>
 <LanguageSwitcher/>
 <button className="menu-toggle" aria-label={menu?t("关闭导航"):t("打开导航")} aria-expanded={menu} aria-controls="mobile-nav" onClick={()=>setMenu(!menu)}>{t("菜单")}<span aria-hidden="true">{menu?"×":"☰"}</span></button>
 <nav id="mobile-nav" className="mobile-nav" aria-label={t("移动端导航")} hidden={!menu} onClick={()=>setMenu(false)}><a href="#about">{t("关于艺术村")}</a><a href="#programs">{t("艺术计划")}</a><a href="#center">{t("关于我们")}</a><a href="#participate">{t("参与共建")}</a></nav>
 </header>
 <main id="main">
 <SeasonalHero onApply={()=>apply("artist")}/>
 <section className="about section-wrap" id="about">
 <div className="section-label"><span>01 / OUR VISION</span><span>{t("关于艺术村")}</span></div>
 <div className="about-content"><h2><span className="heading-phrase">{t("一座艺术村，")}</span>{locale==="en"?" ":null}<span className="heading-phrase">{t("一种与世界相遇的方式。")}</span></h2><div className="about-copy"><p>{t("我们希望在轻井泽的自然与人文之间，为艺术家、创作者与热爱艺术的人，建立一个可以停留、交流、持续创作的地方。")}</p><p>{t("从艺术家驻留到开放工作室，从展览到艺术教育，轻井泽国际艺术村计划连接别墅、露营地及其他适合艺术活动的空间，让创作走进日常，也让不同文化在这里相遇。")}</p></div></div>
 <div className="goals"><div><strong>30–50<span>{t("位 / 年")}</span></strong><p>{t("年度艺术家驻留目标")}</p></div><div><strong>100<span>{t("位")}</span></strong><p>{t("首批各类艺术家招募计划")}</p></div><div className="goals-note"><p><span className="copy-line">{t("面向不同艺术领域与文化背景。")}</span><span className="copy-line">{t("共同建立持续交流的艺术家网络。")}</span></p><span>{t("以上为项目目标，非已入驻或已录取人数。")}</span></div></div>
 </section>
 <section className="programs section-wrap" id="programs"><div className="section-label"><span>02 / ART PROGRAMS</span><span>{t("艺术计划")}</span></div><div className="section-heading"><h2>{t("创作，不止一种可能。")}</h2><p><span className="copy-line">{t("从一次驻留开始，延伸至更长久的交流。")}</span><span className="copy-line">{t("各项活动正在策划，具体时间与空间另行公布。")}</span></p></div><div className="program-list">{programs.map(p=><article className="program" key={p.num}><div className="program-index">{p.num}<span>{p.en}</span></div><h3>{t(p.title)}</h3><p>{t(p.text)}</p><div className="program-tags">{t(p.tags)}</div></article>)}</div><div className="practice-feature" id="meditation-plan"><div className="practice-intro"><div><span className="eyebrow">STILLNESS & CONNECTION</span><h3>{t("禅修与静心驻留")}</h3></div><p>{t("为个人自主实践与团体静心活动，寻找安静、温暖的驻留空间。")}</p></div><div className="practice-gallery"><figure><img src="/residency/personal-autumn.webp" alt={t("女性在秋日别墅内静心禅修，AI 概念图")} width={1536} height={1024} loading="lazy" decoding="async"/><figcaption><strong>{t("个人静心")}</strong><span>{t("将一段时间留给自己。")}</span></figcaption></figure><figure><img src="/residency/group-winter.webp" alt={t("团体在冬日别墅内共同禅修，AI 概念图")} width={1774} height={887} loading="lazy" decoding="async"/><figcaption><strong>{t("团体同行")}</strong><span>{t("由团体自带带领者，协调适合共同实践的空间。")}</span></figcaption></figure></div><p className="practice-image-note">{t("AI 概念意境图，非实际项目场地实拍。")}</p></div></section>
 <section className="invitation section-wrap" id="participate"><div className="section-label"><span>03 / GROW WITH US</span><span>{t("参与共建")}</span></div><div className="section-heading"><h2><span className="heading-phrase">{t("带着你的创作、支持，")}</span>{locale==="en"?" ":null}<span className="heading-phrase">{t("或一处有故事的空间。")}</span></h2><p><span className="copy-line">{t("一个艺术村的生长，来自许多人的参与。")}</span><span className="copy-line">{t("我们期待与你一起，打开更多可能。")}</span></p></div><div className="join-grid">
 <article className="join-card featured"><span className="join-kicker">FOR ARTISTS</span><div className="join-number">100<span>{t("位首批招募")}</span></div><h3>{t("艺术家驻留计划")}</h3><p>{t("希望在轻井泽停留与创作？欢迎介绍你的艺术实践与驻留意向，索取驻留计划、住宿支持及参与条件等资料。")}</p><Button className="join-button" onClick={()=>apply("artist")}>{t("登记驻留意向")}<span aria-hidden="true">↗</span></Button></article>
 <article className="join-card"><span className="join-kicker">FOR MEDITATION</span><div className="join-word">STILLNESS<span>{t("为安静与专注留出时间")}</span></div><h3>{t("禅修与静心驻留支持计划")}</h3><p>{t("欢迎个人自主禅修，或由团体自带带领者开展活动。我们计划协调淡季优惠住宿、安静空间与餐食、交通等配套服务，具体档期和支持条件另行沟通。")}</p><Button className="join-button" onClick={()=>apply("meditation")}>{t("登记禅修意向")}<span aria-hidden="true">↗</span></Button></article>
 <article className="join-card"><span className="join-kicker">FOR PARTNERS</span><div className="join-symbol" aria-hidden="true">＆</div><h3>{t("赞助与支持计划")}</h3><p>{t("以资金、物资或专业服务支持艺术活动与禅修驻留。欢迎选择支持计划、填写支持意向，了解赞助方案、活动展示与合作条件。")}</p><Button className="join-button" onClick={()=>apply("sponsor")}>{t("登记赞助意向")}<span aria-hidden="true">↗</span></Button></article>
 <article className="join-card"><span className="join-kicker">FOR SPACES</span><div className="join-word">SPACE<span>{t("让空间与艺术相遇")}</span></div><h3>{t("别墅与空间合作计划")}</h3><p>{t("让淡季档期与艺术创作相遇。欢迎介绍你的别墅、露营地或活动空间，索取驻留合作、空间使用及运营安排资料。")}</p><p className="space-preparation">{t("需提供空间地址、外观及内部设施照片，图片合计不超过30MB。")}</p><Button className="join-button" onClick={()=>apply("space")}>{t("登记空间意向")}<span aria-hidden="true">↗</span></Button></article>
 </div><p className="join-note">{t("目前接受筹备期意向登记。提交信息不产生费用，也不代表入选或合作成立；具体支持政策、费用及合作权益以正式资料和后续约定为准。")}</p></section>
 <section className="center section-wrap" id="center"><div className="section-label"><span>04 / BEHIND THE VILLAGE</span><span>{t("关于我们")}</span></div><div className="center-grid"><div><p className="eyebrow">KARUIZAWA INTERNATIONAL ART CENTER</p><h2><span className="heading-phrase">{t("以艺术连接人与自然，")}</span>{locale==="en"?" ":null}<span className="heading-phrase">{t("也连接彼此。")}</span></h2></div><div className="center-copy"><h3>{t("轻井泽国际艺术中心（筹）")}</h3><p>{t("轻井泽国际艺术中心拟在日本设立为一般社团法人，以轻井泽为基地，致力于支持艺术创作、促进国际文化交流与推动公众艺术教育。")}</p><p>{t("中心计划通过艺术家驻留、展览、工作坊及文化交流活动，连接国内外艺术家、文化机构与当地社区，让艺术融入自然与日常生活，逐步建立开放、多元、可持续的艺术交流平台。")}</p><p>{t("目前，中心正处于筹备阶段，组织治理与具体事业安排将以正式设立后的章程为准。")}</p></div></div></section>
 <section className="closing"><span>CREATE. STAY. CONNECT.</span><p>{t("下一段创作，从这里开始。")}</p><a href="#participate">{t("探索参与方式")}<span aria-hidden="true">↗</span></a></section>
 </main>
 <footer><div className="footer-top"><a className="footer-name" href="#top">{t("轻井泽国际艺术村")}</a><p><span className="copy-line">{t("日本 · 轻井泽")}</span><span className="copy-line">{t("艺术家驻留 / 国际交流 / 艺术教育")}</span></p><a href="#top">{t("回到顶部 ↑")}</a></div><div className="footer-bottom"><span>{t("© 2026 轻井泽国际艺术中心（筹） 版权所有")}</span><span>{t("网站图片为概念意境图，非实际项目场地实拍。")}</span></div><FooterUtilities/></footer>
 <ApplicationDialog key={formKey} kind={kind} onClose={()=>setKind(null)}/>
 </>;
}
