import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface UseGSAPStaggerOptions {
  stagger?: number;
  duration?: number;
  y?: number;
  ease?: string;
  start?: string;
  once?: boolean;
}

/**
 * GSAP-powered stagger animation hook
 * Animates children elements with smooth stagger effect when container enters viewport
 */
export function useGSAPStagger<T extends HTMLElement = HTMLDivElement>(
  options: UseGSAPStaggerOptions = {}
) {
  const containerRef = useRef<T>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  const {
    stagger = 0.08,
    duration = 0.5,
    y = 20,
    ease = 'power3.out',
    start = 'top 85%',
    once = true,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.children;
    if (children.length === 0) return;

    // Set initial state
    gsap.set(children, { y, opacity: 0 });

    // Create animation with ScrollTrigger
    animationRef.current = gsap.to(children, {
      y: 0,
      opacity: 1,
      duration,
      ease,
      stagger,
      scrollTrigger: {
        trigger: container,
        start,
        once,
      },
    });

    return () => {
      // Cleanup
      if (animationRef.current) {
        animationRef.current.kill();
      }
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, [stagger, duration, y, ease, start, once]);

  return containerRef;
}

/**
 * Simple fade-in animation when element enters viewport
 */
export function useGSAPFadeIn<T extends HTMLElement = HTMLDivElement>(
  options: { duration?: number; y?: number; delay?: number } = {}
) {
  const ref = useRef<T>(null);

  const { duration = 0.6, y = 16, delay = 0 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.set(element, { y, opacity: 0 });

    const animation = gsap.to(element, {
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        once: true,
      },
    });

    return () => {
      animation.kill();
    };
  }, [duration, y, delay]);

  return ref;
}

export default useGSAPStagger;
