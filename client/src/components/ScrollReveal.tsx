import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ReactNode } from "react";

type AnimationDirection = "up" | "down" | "left" | "right" | "fade";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: AnimationDirection;
  delay?: number; // delay in ms
  duration?: number; // duration in ms
  distance?: string; // e.g. "30px"
  className?: string;
  threshold?: number;
  once?: boolean;
}

/**
 * Wrapper component that animates children when they scroll into view.
 * Supports multiple animation directions and configurable timing.
 */
export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  distance = "30px",
  className = "",
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal(threshold, "0px 0px -60px 0px", once);

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0)";
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}, 0)`;
      case "down":
        return `translate3d(0, -${distance}, 0)`;
      case "left":
        return `translate3d(${distance}, 0, 0)`;
      case "right":
        return `translate3d(-${distance}, 0, 0)`;
      case "fade":
        return "translate3d(0, 0, 0)";
      default:
        return `translate3d(0, ${distance}, 0)`;
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
