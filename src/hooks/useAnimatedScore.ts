"use client";

import { useCallback, useEffect, useState } from "react";

interface AnimatedScoreOptions {
  delay?: number;
  duration?: number;
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number;
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function useAnimatedScore<T extends HTMLElement>(
  score: number,
  {
    delay = 220,
    duration = 1600,
    enabled = true,
    rootMargin = "0px 0px -10% 0px",
    threshold = 0.35,
  }: AnimatedScoreOptions = {},
) {
  const [node, setNode] = useState<T | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const elementRef = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    const targetScore = clampScore(score);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let resetFrame = 0;
    let delayTimer = 0;
    let started = false;

    if (!enabled) {
      animationFrame = window.requestAnimationFrame(() => setAnimatedScore(0));
      return () => window.cancelAnimationFrame(animationFrame);
    }

    const animate = () => {
      if (started) return;

      started = true;

      if (reduceMotion) {
        animationFrame = window.requestAnimationFrame(() => setAnimatedScore(targetScore));
        return;
      }

      resetFrame = window.requestAnimationFrame(() => setAnimatedScore(0));

      delayTimer = window.setTimeout(() => {
        const startedAt = performance.now();
        const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

        const tick = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          setAnimatedScore(Math.round(targetScore * easeOutCubic(progress)));

          if (progress < 1) {
            animationFrame = window.requestAnimationFrame(tick);
          }
        };

        animationFrame = window.requestAnimationFrame(tick);
      }, delay);
    };

    if (!node || !("IntersectionObserver" in window)) {
      animate();
      return () => {
        window.clearTimeout(delayTimer);
        window.cancelAnimationFrame(resetFrame);
        window.cancelAnimationFrame(animationFrame);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          animate();
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      window.clearTimeout(delayTimer);
      window.cancelAnimationFrame(resetFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [delay, duration, enabled, node, rootMargin, score, threshold]);

  return [elementRef, animatedScore] as const;
}
