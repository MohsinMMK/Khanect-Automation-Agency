import { DottedSurface } from '@/components/ui/dotted-surface';

export default function DottedSurfaceDemo() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950">
      <DottedSurface />
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <h1 className="font-mono text-4xl font-semibold text-gray-900 dark:text-white">
          Dotted Surface
        </h1>
      </div>
    </div>
  );
}
