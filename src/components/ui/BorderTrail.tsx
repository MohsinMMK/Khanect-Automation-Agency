import { cn } from '@/lib/utils';

type BorderTrailProps = {
  className?: string;
  duration?: number;
};

export function BorderTrail({
  className,
  duration = 5,
}: BorderTrailProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden',
        className
      )}
    >
      <div
        className="absolute inset-[-50%] animate-spin"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, transparent 70%, #a3e635 80%, transparent 100%)',
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
        }}
      />
      {/* Inner cutout to show only border */}
      <div className="absolute inset-[2px] rounded-[inherit] bg-white dark:bg-[#0f0f11]" />
    </div>
  );
}

export default BorderTrail;
