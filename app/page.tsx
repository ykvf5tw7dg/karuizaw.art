"use client";
import { useEffect, useState } from "react";
import { SeasonalHero } from "./seasonal-hero";
import { Button } from "@/components/ui/button";
import { ApplicationDialog, type ApplicationKind } from "./application-dialog";
const programs = [
 {num:"01",en:"ARTIST RESIDENCY",title:"艺术家驻留",text:"将一段时间留给创作。计划为不同领域的艺术家连接驻留空间，支持独立创作、跨界交流与在地探索。",tags:"绘画 / 雕塑 / 影像 / 设计 / 更多领域"},
 {num:"02",en:"EXHIBITIONS & EXCHANGE",title:"展览与艺术交流",text:"让作品成为对话的起点。规划展览、开放工作室、艺术家分享与国际交流，让创作与更广泛的公众相遇。",tags:"开放工作室 / 策展 / 国际交流"},
 {num:"03",en:"ART & LEARNING",title:"艺术教育与体验",text:"让艺术融入生活。探索工作坊、艺术夏令营与跨文化学习，让不同年龄、不同背景的人参与创作。",tags:"艺术工作坊 / 夏令营 / 公众活动"},
];
export default function Home(){
 const [menu,setMenu]=useState(false);
 const [kind,setKind]=useState<ApplicationKind|null>(null);
 const [formKey,setFormKey]=useState(0);
 function apply(next:ApplicationKind){setFormKey(k=>k+1);setKind(next);}
 useEffect(()=>{
   const modelContext=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
   if(!modelContext?.registerTool)return;
   const lifecycle=new AbortController();
   Promise.resolve(modelContext.registerTool({name:"start_art_village_application",title:"打开艺术村申请表",description:"按类型打开艺术家、赞助合作或别墅及空间申请表；不会提交或保存个人资料。",inputSchema:{type:"object",properties:{type:{type:"string",enum:["artist","sponsor","space"]}},required:["type"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input:unknown)=>{const type=(input as {type?:string})?.type;if(!["artist","sponsor","space"].includes(type??""))throw new Error("申请类型无效");apply(type as ApplicationKind);await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));return {opened:true,type,submitted:false};}},{signal:lifecycle.signal})).catch(()=>{});
   return ()=>lifecycle.abort();
 },[]);
 return <>
 <a className="skip" href="#main">跳至正文</a>
 <header className="site-header">
 <a className="brand" href="#top" aria-label="轻井泽国际艺术村首页"><span className="brand-mark" aria-hidden="true">K<span>／</span></span><span><strong>轻井泽国际艺术村</strong><small>KARUIZAWA INTERNATIONAL ART VILLAGE</small></span></a>
 <nav aria-label="主导航"><a href="#about">关于艺术村</a><a href="#programs">艺术计划</a><a href="#center">关于我们</a><a className="nav-visit" href="#participate">参与共建 <span aria-hidden="true">↗</span></a></nav>
 <button className="menu-toggle" aria-label={menu?"关闭导航":"打开导航"} aria-expanded={menu} aria-controls="mobile-nav" onClick={()=>setMenu(!menu)}>菜单 <span aria-hidden="true">{menu?"×":"☰"}</span></button>
 <nav id="mobile-nav" className="mobile-nav" aria-label="移动端导航" hidden={!menu} onClick={()=>setMenu(false)}><a href="#about">关于艺术村</a><a href="#programs">艺术计划</a><a href="#center">关于我们</a><a href="#participate">参与共建</a></nav>
 </header>
 <main id="main">
 <SeasonalHero onApply={()=>apply("artist")}/>
 <section className="about section-wrap" id="about">
 <div className="section-label"><span>01 / OUR VISION</span><span>关于艺术村</span></div>
 <div className="about-content"><h2>一座艺术村，<br/>一种与世界相遇的方式。</h2><div className="about-copy"><p>我们希望在轻井泽的自然与人文之间，为艺术家、创作者与热爱艺术的人，建立一个可以停留、交流、持续创作的地方。</p><p>从艺术家驻留到开放工作室，从展览到艺术教育，轻井泽国际艺术村计划连接别墅、露营地及其他适合艺术活动的空间，让创作走进日常，也让不同文化在这里相遇。</p></div></div>
 <div className="goals"><div><strong>30–50<span> 位 / 年</span></strong><p>年度艺术家驻留目标</p></div><div><strong>100<span> 位</span></strong><p>首批各类艺术家招募计划</p></div><div className="goals-note"><p>面向不同艺术领域与文化背景。<br/>共同建立持续交流的艺术家网络。</p><span>以上为项目目标，非已入驻或已录取人数。</span></div></div>
 </section>
 <section className="programs section-wrap" id="programs"><div className="section-label"><span>02 / ART PROGRAMS</span><span>艺术计划</span></div><div className="section-heading"><h2>创作，不止一种可能。</h2><p>从一次驻留开始，延伸至更长久的交流。<br/>各项活动正在策划，具体时间与空间另行公布。</p></div><div className="program-list">{programs.map(p=><article className="program" key={p.num}><div className="program-index">{p.num}<span>{p.en}</span></div><h3>{p.title}</h3><p>{p.text}</p><div className="program-tags">{p.tags}</div></article>)}</div></section>
 <section className="invitation section-wrap" id="participate"><div className="section-label"><span>03 / GROW WITH US</span><span>参与共建</span></div><div className="section-heading"><h2>带着你的创作、支持，<br/>或一处有故事的空间。</h2><p>一个艺术村的生长，来自许多人的参与。<br/>我们期待与你一起，打开更多可能。</p></div><div className="join-grid">
 <article className="join-card featured"><span className="join-kicker">FOR ARTISTS</span><div className="join-number">100<span>位首批招募</span></div><h3>成为驻留艺术家</h3><p>欢迎绘画、雕塑、摄影、影像、装置、音乐、设计等领域的艺术家，提交作品资料与创作意向。</p><Button className="join-button" onClick={()=>apply("artist")}>艺术家申请 <span aria-hidden="true">↗</span></Button></article>
 <article className="join-card"><span className="join-kicker">FOR PARTNERS</span><div className="join-symbol" aria-hidden="true">＆</div><h3>成为艺术支持者</h3><p>欢迎企业、品牌、机构及个人，以资金、物资、专业服务或传播资源，支持艺术家与艺术计划。</p><Button className="join-button" onClick={()=>apply("sponsor")}>赞助合作申请 <span aria-hidden="true">↗</span></Button></article>
 <article className="join-card"><span className="join-kicker">FOR SPACES</span><div className="join-word">SPACE<span>让空间与艺术相遇</span></div><h3>让你的空间加入</h3><p>面向轻井泽及周边的别墅、露营地、工作室与活动空间，探索艺术驻留和文化活动的合作可能。</p><Button className="join-button" onClick={()=>apply("space")}>别墅及空间加入申请 <span aria-hidden="true">↗</span></Button></article>
 </div><p className="join-note">目前接受筹备期意向申请。提交申请不代表录取、驻留名额确认或合作成立；具体安排及条件另行沟通。</p></section>
 <section className="center section-wrap" id="center"><div className="section-label"><span>04 / BEHIND THE VILLAGE</span><span>关于我们</span></div><div className="center-grid"><div><p className="eyebrow">KARUIZAWA INTERNATIONAL ART CENTER</p><h2>以艺术连接人与自然，<br/>也连接彼此。</h2></div><div className="center-copy"><h3>轻井泽国际艺术中心（筹）</h3><p>轻井泽国际艺术中心拟在日本设立为一般社团法人，以轻井泽为基地，致力于支持艺术创作、促进国际文化交流与推动公众艺术教育。</p><p>中心计划通过艺术家驻留、展览、工作坊及文化交流活动，连接国内外艺术家、文化机构与当地社区，让艺术融入自然与日常生活，逐步建立开放、多元、可持续的艺术交流平台。</p><p>目前，中心正处于筹备阶段，组织治理与具体事业安排将以正式设立后的章程为准。</p></div></div></section>
 <section className="closing"><span>CREATE. STAY. CONNECT.</span><p>下一段创作，从这里开始。</p><a href="#participate">探索参与方式 <span aria-hidden="true">↗</span></a></section>
 </main>
 <footer><div className="footer-top"><a className="footer-name" href="#top">轻井泽国际艺术村</a><p>日本 · 轻井泽<br/>艺术家驻留 / 国际交流 / 艺术教育</p><a href="#top">回到顶部 ↑</a></div><div className="footer-bottom"><span>© 2026 轻井泽国际艺术中心（筹） 版权所有</span><span>网站图片为概念意境图，非实际项目场地实拍。</span></div></footer>
 <ApplicationDialog key={formKey} kind={kind} onClose={()=>setKind(null)}/>
 </>;
}
