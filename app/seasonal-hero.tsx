"use client";
import { useLanguage } from "./language";
import { useEffect, useState } from "react";
import { Carousel,CarouselContent,CarouselItem,type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
const seasons=[
 {
  "key": "spring",
  "name": "春",
  "en": "SPRING",
  "scene": "春日室内绘画",
  "alt": "艺术家在春日别墅内绘画，窗外新绿与樱花，AI 概念图",
  "kind": "artist",
  "mode": "individual",
  "kicker": "首批艺术家招募计划",
  "title": [
   "在春光中落笔，",
   "让灵感生长。"
  ],
  "description": [
   "让新绿与光影，成为画布上的故事。",
   "邀请 100 位艺术家，共同开启轻井泽的创作旅程。"
  ],
  "note": "填写绘画创作与驻留意向，了解参与方式。"
 },
 {
  "key": "summer",
  "name": "夏",
  "en": "SUMMER",
  "scene": "夏日室内雕塑",
  "alt": "艺术家在夏日别墅内创作雕塑，窗外绿林，AI 概念图",
  "kind": "artist",
  "mode": "individual",
  "kicker": "首批艺术家招募计划",
  "title": [
   "在林间塑形，",
   "让想象成真。"
  ],
  "description": [
   "在安静的工作室，把想法化为作品。",
   "邀请 100 位艺术家，共同开启轻井泽的创作旅程。"
  ],
  "note": "填写雕塑创作与驻留意向，了解参与方式。"
 },
 {
  "key": "autumn",
  "name": "秋",
  "en": "AUTUMN",
  "scene": "秋日团体禅修",
  "alt": "团体在秋日红枫庭院的户外平台禅修，AI 概念图",
  "kind": "meditation",
  "mode": "group",
  "kicker": "团体禅修支持计划",
  "title": [
   "在秋林中静坐，",
   "与同伴共修。"
  ],
  "description": [
   "在红枫与静谧之间，留出共同练习的时间。",
   "欢迎团体自带带领者，登记禅修与静心驻留意向。"
  ],
  "note": "填写人数、时间与空间需求，了解支持条件。"
 },
 {
  "key": "winter",
  "name": "冬",
  "en": "WINTER",
  "scene": "冬日静心禅修",
  "alt": "一位女性在温暖别墅内禅修，窗外冬日雪林，AI 概念图",
  "kind": "meditation",
  "mode": "individual",
  "kicker": "个人静心支持计划",
  "title": [
   "在冬日里静心，",
   "与自己相遇。"
  ],
  "description": [
   "窗外是雪，室内是温暖与安静。",
   "欢迎个人自主实践，为自己留下一段静心时光。"
  ],
  "note": "填写个人禅修与驻留意向，了解参与方式。"
 }
] as const;
export function SeasonalHero({onApply}:{onApply:(kind:"artist"|"meditation",mode:"individual"|"group")=>void}){
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
 <Carousel className="season-carousel" setApi={setApi} opts={{loop:true,duration:45}} aria-label={t("四季艺术与禅修背景轮播")}>
 <CarouselContent className="season-track">{seasons.map((s,i)=><CarouselItem className="season-slide" data-season={s.key} key={s.key} aria-label={`${i+1} / 4: ${t(s.name)} · ${t(s.scene)}`} aria-hidden={selected!==i}><img src={`/seasons/${s.key}-residency.webp`} alt={t(s.alt)} fetchPriority={i===0?'high':'auto'} decoding="async"/></CarouselItem>)}</CarouselContent>
 </Carousel>
 <div className="hero-shade"/>
 <div className="hero-topline"><span>ART · NATURE · CONNECTION</span><span>{t(content.kicker)}</span></div>
 <div className="hero-content"><h1 id="hero-title">{content.title.map(line=><span className="copy-line" key={line}>{t(line)}</span>)}</h1><p className="hero-description">{content.description.map(line=><span className="copy-line" key={line}>{t(line)}</span>)}</p><p className="hero-interest-note">{t(content.note)}</p><div className="hero-actions"><button type="button" className="light-button" onClick={()=>{setPaused(true);onApply(content.kind,content.mode);}} aria-haspopup="dialog">{t(content.kind==="artist"?"登记驻留意向":"登记禅修意向")}<span aria-hidden="true">↗</span></button><a className="hero-secondary" href={content.kind==="artist"?"#about":"#meditation-plan"}>{t(content.kind==="artist"?"了解艺术村":"了解禅修计划")}<span aria-hidden="true">↓</span></a></div></div>
 <div className="season-controls" aria-label={t("轮播控制")}><div className="season-switches">{seasons.map((s,i)=><Button key={s.key} className="season-button" variant="ghost" aria-label={`${t("切换到")} ${t(s.name)}`} aria-pressed={selected===i} onClick={()=>choose(i)}><span>{t(s.name)}</span><small>{s.en}</small></Button>)}</div><Button className="season-pause" variant="ghost" aria-label={paused?t("播放四季轮播"):t("暂停四季轮播")} onClick={()=>setPaused(!paused)}>{paused?t("播放 ▷"):t("暂停 Ⅱ")}</Button></div>
 <div className="hero-bottom"><span className="season-caption" aria-live={paused?'polite':'off'}>{String(selected+1).padStart(2,'0')} / 04 <span>{t(seasons[selected].name)} · {t(seasons[selected].scene)}</span></span><span className="image-caption">{t("艺术与禅修 · AI 概念意境图")}</span></div>
 </section>;
}
