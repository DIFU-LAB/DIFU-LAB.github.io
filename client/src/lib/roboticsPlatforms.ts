import records from "@content/team/robots.json";
export type RoboticsPlatform = {
  id: string;
  name: string;
  type: string;
  description: string;
  detailsUrl: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    credit: string;
    sourceUrl: string;
  };
};

export const roboticsPlatforms: RoboticsPlatform[] = records;
