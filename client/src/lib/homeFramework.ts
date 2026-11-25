import records from "@content/pages/home/framework.json";
export type FrameworkIcon =
  | "hand"
  | "eye"
  | "smile"
  | "mirror"
  | "personality"
  | "tasks"
  | "tracking"
  | "model"
  | "data"
  | "middleware";

export interface FrameworkItem {
  id: string;
  label: string;
  icon: FrameworkIcon;
  alt: string;
  image: { src: string; srcSet: string };
}

export const homeFramework = records as Omit<typeof records, "inputs" | "methods"> & {inputs: Omit<typeof records.inputs,"items"> & {items:FrameworkItem[]}; methods:Omit<typeof records.methods,"items"> & {items:FrameworkItem[]}};
