declare module "virtual:responsive-media" {
  const manifest: Record<string, { width: number; height: number; variants: { path: string; width: number }[] }>;
  export default manifest;
}
