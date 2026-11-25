import { records as loadRecords } from "./collections";
const records = loadRecords<GalleryItem>(import.meta.glob("../../../content/gallery/*.json", {eager:true, import:"default"}));

export type GalleryItem = {
  id: string;
  image: string;
  title: string;
  category: string;
  description: string;
  date: string | null;
  dateLabel: string | null;
  sourceUrl: string;
  sourceLabel: string;
  originalImageUrl: string;
  width: number;
  height: number;
  originalHostedImage?: string;
  retouch?: {
    subject: string;
    treatment: string;
    date: string;
  };
};

export const galleryItems: GalleryItem[] = records;
export const galleryCategories = Array.from(
  new Set(galleryItems.map(item => item.category))
);
