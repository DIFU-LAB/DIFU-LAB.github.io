import { useState, type ImgHTMLAttributes } from "react";
import manifest from "virtual:responsive-media";

interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Keep the original for an explicit high-resolution/lightbox view. */
  original?: boolean;
}
/** The browser selects a candidate using sizes, viewport width and pixel density.
 * Hand-authored srcsets, remote images and original-resolution views are untouched.
 */
export function ResponsiveImage({ src, srcSet, sizes, original, width, height, loading = "lazy", decoding = "async", onError, ...props }: ResponsiveImageProps) {
  const [failed, setFailed] = useState<string>();
  const prefix = import.meta.env.BASE_URL + "media/";
  const entry = src?.startsWith(prefix) ? manifest[src.slice(prefix.length)] : undefined;
  const variants = !original && !srcSet && failed !== src ? entry?.variants : undefined;
  const generated = !!variants?.length;
  const candidates = generated ? variants! : [];
  const fallback = candidates.find(v => v.width >= 800) ?? candidates.at(-1);
  return <img {...props}
    width={width ?? entry?.width} height={height ?? entry?.height}
    loading={loading} decoding={decoding}
    sizes={sizes ?? (generated ? "100vw" : undefined)}
    srcSet={generated ? candidates.map(v => `${prefix}${v.path} ${v.width}w`).join(", ") : srcSet}
    src={fallback ? prefix + fallback.path : src}
    onError={event => {
      if (generated && src) { setFailed(src); return; }
      onError?.(event);
    }} />;
}
