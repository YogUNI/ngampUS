"use client";

import { useEffect, useRef } from "react";

interface ScrollEntranceProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "fade" | "scale";
}

export function ScrollEntrance({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollEntranceProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("dashboard-revealed");
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const directionClass = 
    direction === "scale" ? "dashboard-scale" :
    direction === "fade" ? "dashboard-fade" :
    "dashboard-up";

  return (
    <div
      ref={elementRef}
      className={`dashboard-animate-init ${directionClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
