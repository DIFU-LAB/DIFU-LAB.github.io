import { useEffect, useRef, useState } from "react";

/**
 * Hook that detects when an element enters the viewport and triggers a reveal animation.
 * Uses IntersectionObserver for performant scroll detection.
 *
 * @param threshold - Percentage of element visible before triggering (0-1). Default 0.15
 * @param rootMargin - Margin around the root. Default "0px 0px -60px 0px" (trigger slightly before fully in view)
 * @param once - If true, only triggers once. Default true
 */
export function useScrollReveal(
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
  once = true
) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
