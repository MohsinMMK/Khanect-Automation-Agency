import { useEffect, useRef, Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';
import { useAnimate, useInView, stagger } from 'framer-motion';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  duration?: number;
  y?: number;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Container component that animates its children with a stagger effect
 * when scrolled into view using Framer Motion
 */
function StaggerContainer({
  children,
  className = '',
  stagger: staggerDelay = 0.12,
  duration = 0.6,
  y = 24,
  delay = 0.1,
  as: Component = 'div',
}: StaggerContainerProps) {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, {
    once: true,
    margin: '-15% 0px' // Equivalent to GSAP's 'top 85%'
  });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current && scope.current) {
      hasAnimated.current = true;

      // Animate direct children using CSS transform
      animate(
        Array.from(scope.current.children),
        { opacity: 1, transform: 'translateY(0px)' },
        {
          duration,
          delay: stagger(staggerDelay, { startDelay: delay }),
          ease: [0.4, 0, 0.2, 1] // Equivalent to 'power2.out'
        }
      );
    }
  }, [isInView, animate, scope, duration, staggerDelay, delay]);

  // Set initial styles on children
  const styledChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child as ReactElement<{ style?: React.CSSProperties }>, {
        style: {
          ...(child.props as { style?: React.CSSProperties }).style,
          opacity: 0,
          transform: `translateY(${y}px)`,
        },
      });
    }
    return child;
  });

  return (
    <Component ref={scope} className={className}>
      {styledChildren}
    </Component>
  );
}

export default StaggerContainer;
