import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type BorderTrailProps = {
  className?: string;
  duration?: number;
  borderWidth?: number;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  duration = 5,
  borderWidth = 2,
  style,
}: BorderTrailProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        padding: borderWidth,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
      }}
    >
      <motion.div
        className={cn(
          'absolute inset-[-200%] rounded-[inherit]',
          className
        )}
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, var(--trail-color, #a3e635) 45deg, transparent 90deg)',
          ...style,
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

export default BorderTrail;
