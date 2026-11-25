import { records } from "./collections";
import type { NewsSource } from "@shared/news";
export interface NewsItem {id: number | string; linkedinUrl:string; title:string; titleZh?:string; excerpt?:string|null; excerptZh?:string; content?:string|null; imageUrl?:string|null; publishedAt:string; source?:NewsSource;}
export const newsItems = records<NewsItem>(import.meta.glob("../../../content/news/*.json", {eager:true, import:"default"})).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
