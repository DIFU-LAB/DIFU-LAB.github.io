export { labInfo, navItems } from "./site";
import profile from "@content/pages/about-di/profile.json";
import groups from "@content/team/groups.json";
import type { VideoSource } from "@/lib/videoSources";
import findings from "@content/research/findings.json";
import type { FindingNewsImage } from "@/components/FindingMedia";
export { researchAreas, researchNarrative } from "./research";
export const diProfile = profile;
export type TeamMember = {
  name: string;
  affiliation: string;
  institution: string;
  background?: string;
  role?: string;
  photo?: {
    src: string;
    width: number;
    height: number;
    position?: string;
  };
};

export const teamGroups: {id:string; title:string; role:string; members:TeamMember[]}[] = groups;
export interface ResearchFinding {id:string;title:string;paperTitle:string;venue:string;description:string;paperUrl:string;videoId?:string;sources?:VideoSource[];videoLabel?:string;newsUrl?:string;newsImage?:FindingNewsImage;videoSrc?:string;poster?:string}
export const researchHighlights: ResearchFinding[] = findings;
