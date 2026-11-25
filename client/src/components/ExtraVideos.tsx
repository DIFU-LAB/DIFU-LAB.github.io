import { useTranslation } from "react-i18next";
import { records } from "@/lib/collections";
import { useLanguage } from "@/contexts/LanguageContext";
import { getVideoSources, type VideoRecord } from "@/lib/videoSources";
import { ResearchVideo } from "./ResearchVideo";
import { ScrollReveal } from "./ScrollReveal";
type Video = VideoRecord & {id:string;title:string;description?:string;poster?:string;captionsEn?:string;captionsZh?:string};
const videos=records<Video>(import.meta.glob('../../../content/videos/*.json',{eager:true,import:'default'}));
export function ExtraVideos(){
  const { t } = useTranslation();
  const { language, c } = useLanguage(); if(!videos.length)return null;
  return <section className="mt-20 pt-14 border-t border-[#E2E8F0]">
    <h2 className="text-3xl lg:text-5xl text-[#1B2A4A] mb-10">{t("Research videos")}</h2>
    <div className="grid md:grid-cols-2 gap-6">{videos.map(v=>{
      const title=c(v, "title");
      return <ScrollReveal key={v.id} direction="up" duration={500}><article className="border border-[#E2E8F0] rounded-sm overflow-hidden h-full">
        <ResearchVideo sources={getVideoSources(v)} title={title} captionsEn={v.captionsEn} captionsZh={v.captionsZh} poster={v.poster?{src:v.poster,width:1280,height:720}:undefined}/>
        <div className="p-7"><h3 className="text-2xl text-[#1B2A4A]">{title}</h3><p className="text-sm text-[#4A5568] mt-3">{c(v, "description")}</p></div>
      </article></ScrollReveal>
    })}</div>
  </section>;
}
