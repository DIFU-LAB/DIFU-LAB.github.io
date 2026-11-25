import imagery from "@content/research/imagery.json";

export interface ResearchImage {
  id: string;
  title: string;
  alt: string;
  caption: string;
  credit: string;
  sourceLabel: string;
  kind: string;
  paperUrl: string;
  src: string;
  srcSet: string;
  fullSrc: string;
  width: number;
  height: number;
}

export const researchImagery: Record<keyof typeof imagery, ResearchImage> =
  imagery;
