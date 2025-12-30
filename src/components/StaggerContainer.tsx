import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  duration?: number;
  y?: number;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Container component that animates its children with a stagger effect
 * when scrolled into view using GSAP
 */
const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  stagger = 0.12,
  duration = 0.6,
  y = 24,
  delay = 0.1,
  as: Component = 'div',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.children;
    if (children.length === 0) return;

    // Set initial state
    gsap.set(children, { y, opacity: 0 });

    // Create stagger animation
    const animation = gsap.to(children, {
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: 'power2.out',
      stagger,
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        once: true,
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, [stagger, duration, y, delay]);

  return (
    <Component ref={containerRef as any} className={className}>
      {children}
    </Component>
  );
};

export default StaggerContainer;
