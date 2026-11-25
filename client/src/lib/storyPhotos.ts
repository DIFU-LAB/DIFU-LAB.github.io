import type { StoryPhoto } from "@/components/StoryPhotoFigure";
import records from "@content/pages/about-di/photos.json";
export const storyPhotos = records as Record<StoryPhoto["id"], StoryPhoto>;
