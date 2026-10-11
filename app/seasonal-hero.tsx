"use client";
import { useLanguage } from "./language";
import { useEffect, useState } from "react";
import { Carousel,CarouselContent,CarouselItem,type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
const seasons=[
 {key:'spring',name:'春',en:'SPRING',scene:'品茗与闻香',image:'/seasons/tea-incense.webp',alt:'一位老师与两位参与者在林间别墅内品茗闻香，AI 概念图',kind:'meditation',mode:'group',kicker:'静心驻留与文化体验',title:['在茶香之间，','安住当下。'],description:['与老师及同伴围坐，在品茗与闻香中感受专注。','文化体验融入静心驻留，具体安排另行沟通。'],note:'登记平日与淡季驻留意向，了解参与方式。'},
 {key:'summer',name:'夏',en:'SUMMER',scene:'静心绘画',image:'/seasons/spring-residency.webp',alt:'参与者在林间别墅内安静绘画，AI 概念图',kind:'meditation',mode:'individual',kicker:'艺术融入静心生活',title:['用一笔色彩，','专注眼前。'],description:['让绘画成为静心时光中的一段日常。','也可以阅读、书写，在自己的节奏中安静停留。'],note:'填写禅修意向与体验兴趣，活动安排另行沟通。'},
 {key:'autumn',name:'秋',en:'AUTUMN',scene:'秋日团体禅修',image:'/seasons/autumn-residency.webp',alt:'团体在秋日红枫庭院的户外平台禅修，AI 概念图',kind:'meditation',mode:'group',kicker:'团体共修与文化体验',title:['与同伴静坐，','听见秋林。'],description:['在红枫与静谧之间，留出共同练习的时间。','闻香、插花与品茶，可按需求及带领者安排协调。'],note:'填写人数、时间与空间需求，了解支持条件。'},
 {key:'winter',name:'冬',en:'WINTER',scene:'冬日静心禅修',image:'/seasons/winter-residency.webp',alt:'一位女性在温暖别墅内禅修，窗外冬日雪林，AI 概念图',kind:'meditation',mode:'individual',kicker:'个人静心驻留',title:['在冬日里，','留时间给自己。'],description:['窗外是雪，室内是温暖与安静。','从静坐到阅读、书法与写作，感受从容的日常。'],note:'填写个人禅修与驻留意向，了解参与方式。'}
] as const;
export function SeasonalHero({onApply}:{onApply:(kind:"meditation",mode:"individual"|"group")=>void}){
 const {t}=useLanguage();
 const [api,setApi]=useState<CarouselApi>();
 const [selected,setSelected]=useState(0);
 const [paused,setPaused]=useState(false);
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{const mq=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(mq.matches);if(mq.matches)setPaused(true);};update();mq.addEventListener('change',update);return()=>mq.removeEventListener('change',update);},[]);
 useEffect(()=>{if(!api)return;const select=()=>setSelected(api.selectedScrollSnap());select();api.on('select',select);api.on('reInit',select);return()=>{api.off('select',select);api.off('reInit',select);};},[api]);
 useEffect(()=>{if(!api||paused)return;const timer=setInterval(()=>{if(!document.hidden)api.scrollNext(reduced);},6500);return()=>clearInterval(timer);},[api,paused,reduced]);
 const content=seasons[selected];
 function choose(index:number){setPaused(true);api?.scrollTo(index,reduced);}
 return <section className="hero seasonal-hero" id="top" aria-labelledby="hero-title">
 <Carousel className="season-carousel" setApi={setApi} opts={{loop:true,duration:45}} aria-label={t("四季禅修与静心生活轮播")}>
 <CarouselContent className="season-track">{seasons.map((s,i)=><CarouselItem className="season-slide" data-season={s.key} key={s.key} aria-label={`${i+1} / 4: ${t(s.name)} · ${t(s.scene)}`} aria-hidden={selected!==i}><img src={s.image} alt={t(s.alt)} fetchPriority={i===0?'high':'auto'} decoding="async"/></CarouselItem>)}</CarouselContent>
 </Carousel>
 <div className="hero-shade"/>
 <div className="hero-topline"><span>NATURE · STILLNESS · CONNECTION</span><span>{t(content.kicker)}</span></div>
 <div className="hero-content"><h1 id="hero-title">{content.title.map(line=><span className="copy-line" key={line}>{t(line)}</span>)}</h1><p className="hero-description">{content.description.map(line=><span className="copy-line" key={line}>{t(line)}</span>)}</p><p className="hero-interest-note">{t(content.note)}</p><div className="hero-actions"><button type="button" className="light-button" onClick={()=>{setPaused(true);onApply(content.kind,content.mode);}} aria-haspopup="dialog">{t("登记禅修意向")}<span aria-hidden="true">↗</span></button><a className="hero-secondary" href="#meditation-plan">{t("了解驻留方式")}<span aria-hidden="true">↓</span></a></div></div>
 <div className="season-controls" aria-label={t("轮播控制")}><div className="season-switches">{seasons.map((s,i)=><Button key={s.key} className="season-button" variant="ghost" aria-label={`${t("切换到")} ${t(s.name)}`} aria-pressed={selected===i} onClick={()=>choose(i)}><span>{t(s.name)}</span><small>{s.en}</small></Button>)}</div><Button className="season-pause" variant="ghost" aria-label={paused?t("播放四季轮播"):t("暂停四季轮播")} onClick={()=>setPaused(!paused)}>{paused?t("播放 ▷"):t("暂停 Ⅱ")}</Button></div>
 <div className="hero-bottom"><span className="season-caption" aria-live={paused?'polite':'off'}>{String(selected+1).padStart(2,'0')} / 04 <span>{t(seasons[selected].name)} · {t(seasons[selected].scene)}</span></span><span className="image-caption">{t("禅修与静心生活 · AI 概念图")}</span></div>
 </section>;
}
