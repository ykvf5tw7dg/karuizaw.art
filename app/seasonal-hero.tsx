"use client";
import { useLanguage } from "./language";
import { useEffect, useState } from "react";
import { Carousel,CarouselContent,CarouselItem,type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
const seasons=[
 {key:"spring",name:"春",en:"SPRING",villa:"林间石木别墅",alt:"春日新绿与樱花间的石木别墅，AI 概念图"},
 {key:"summer",name:"夏",en:"SUMMER",villa:"森居玻璃别墅",alt:"夏日浓绿森林里的现代木与玻璃别墅，AI 概念图"},
 {key:"autumn",name:"秋",en:"AUTUMN",villa:"枫庭日式别墅",alt:"秋日红枫与金色树叶环绕的日式庭院别墅，AI 概念图"},
 {key:"winter",name:"冬",en:"WINTER",villa:"雪见山间别墅",alt:"冬日雪林中的尖顶木屋别墅，窗内透出暖光，AI 概念图"},
];
export function SeasonalHero(){
 const {t}=useLanguage();
 const [api,setApi]=useState<CarouselApi>();
 const [selected,setSelected]=useState(0);
 const [paused,setPaused]=useState(false);
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{const mq=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(mq.matches);if(mq.matches)setPaused(true);};update();mq.addEventListener('change',update);return()=>mq.removeEventListener('change',update);},[]);
 useEffect(()=>{if(!api)return;const select=()=>setSelected(api.selectedScrollSnap());select();api.on('select',select);api.on('reInit',select);return()=>{api.off('select',select);api.off('reInit',select);};},[api]);
 useEffect(()=>{if(!api||paused)return;const timer=setInterval(()=>{if(!document.hidden)api.scrollNext(reduced);},6500);return()=>clearInterval(timer);},[api,paused,reduced]);
 function choose(index:number){setPaused(true);api?.scrollTo(index,reduced);}
 return <section className="hero seasonal-hero" id="top" aria-labelledby="hero-title">
 <Carousel className="season-carousel" setApi={setApi} opts={{loop:true,duration:45}} aria-label={t("四季别墅背景轮播")}>
 <CarouselContent className="season-track">{seasons.map((s,i)=><CarouselItem className="season-slide" key={s.key} aria-label={`${i+1} / 4: ${t(s.name)} · ${t(s.villa)}`} aria-hidden={selected!==i}><img src={`/seasons/${s.key}.png`} alt={t(s.alt)} fetchPriority={i===0?'high':'auto'} decoding="async"/></CarouselItem>)}</CarouselContent>
 </Carousel>
 <div className="hero-shade"/>
 <div className="hero-topline"><span>JAPAN · KARUIZAWA</span><span>{t("首批艺术家招募计划")}</span></div>
 <div className="hero-content"><h1 id="hero-title"><span className="copy-line">{t("在自然中创作，")}</span><span className="copy-line">{t("在艺术中相遇。")}</span></h1><p className="hero-description"><span className="copy-line">{t("让森林成为灵感，让相遇成为作品。")}</span><span className="copy-line">{t("邀请 100 位艺术家，共同开启轻井泽的创作旅程。")}</span></p><p className="hero-interest-note">{t("填写创作与驻留意向，了解参与方式。")}</p><div className="hero-actions"><a className="light-button" href="#participate">{t("登记驻留意向")}<span aria-hidden="true">↓</span></a><a className="hero-secondary" href="#about">{t("了解艺术村")}<span aria-hidden="true">↓</span></a></div></div>
 <div className="season-controls" aria-label={t("轮播控制")}><div className="season-switches">{seasons.map((s,i)=><Button key={s.key} className="season-button" variant="ghost" aria-label={`${t("切换到")} ${t(s.name)}`} aria-pressed={selected===i} onClick={()=>choose(i)}><span>{t(s.name)}</span><small>{s.en}</small></Button>)}</div><Button className="season-pause" variant="ghost" aria-label={paused?t("播放四季轮播"):t("暂停四季轮播")} onClick={()=>setPaused(!paused)}>{paused?t("播放 ▷"):t("暂停 Ⅱ")}</Button></div>
 <div className="hero-bottom"><span className="season-caption" aria-live={paused?'polite':'off'}>{String(selected+1).padStart(2,'0')} / 04 <span>{t(seasons[selected].name)} · {t(seasons[selected].villa)}</span></span><span className="image-caption">{t("四季别墅 · AI 概念意境图")}</span></div>
 </section>;
}
