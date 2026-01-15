"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Context for Timeline
interface TimelineContextValue {
  activeStep: number;
  orientation: "horizontal" | "vertical";
}

const TimelineContext = React.createContext<TimelineContextValue>({
  activeStep: 0,
  orientation: "vertical",
});

// Timeline Root
interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: number;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, children, defaultValue = 0, orientation = "vertical", ...props }, ref) => {
    return (
      <TimelineContext.Provider value={{ activeStep: defaultValue, orientation }}>
        <div
          ref={ref}
          data-orientation={orientation}
          className={cn(
            "group/timeline",
            orientation === "vertical" ? "flex flex-col" : "flex flex-row",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TimelineContext.Provider>
    );
  }
);
Timeline.displayName = "Timeline";

// Timeline Item
interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  children: React.ReactNode;
}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, step, children, ...props }, ref) => {
    const { activeStep, orientation } = React.useContext(TimelineContext);
    const isActive = step === activeStep;
    const isCompleted = step < activeStep;

    return (
      <div
        ref={ref}
        data-step={step}
        data-active={isActive}
        data-completed={isCompleted}
        data-orientation={orientation}
        className={cn(
          "group/item relative",
          orientation === "vertical" ? "pb-10 pl-10 last:pb-0" : "pr-10 pt-10 last:pr-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

// Timeline Header
interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3 relative", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineHeader.displayName = "TimelineHeader";

// Timeline Separator (the line)
interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineSeparator = React.forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = React.useContext(TimelineContext);

    return (
      <div
        ref={ref}
        className={cn(
          "absolute bg-gradient-to-b from-brand-lime/50 to-brand-lime/20",
          orientation === "vertical"
            ? "left-[19px] top-12 -bottom-0 w-0.5 group-last/item:hidden"
            : "left-12 top-[19px] right-0 h-0.5 group-last/item:hidden",
          className
        )}
        {...props}
      />
    );
  }
);
TimelineSeparator.displayName = "TimelineSeparator";

// Timeline Indicator (the dot with icon)
interface TimelineIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
}

const TimelineIndicator = React.forwardRef<HTMLDivElement, TimelineIndicatorProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full",
          "bg-brand-lime shadow-lg shadow-brand-lime/30 text-black",
          "transition-all duration-300 group-hover/item:scale-110 group-hover/item:shadow-xl group-hover/item:shadow-brand-lime/40",
          "group-data-[completed=true]/item:bg-brand-lime",
          "group-data-[active=true]/item:ring-4 group-data-[active=true]/item:ring-brand-lime/30",
          className
        )}
        {...props}
      >
        {icon || children}
      </div>
    );
  }
);
TimelineIndicator.displayName = "TimelineIndicator";

// Timeline Date (duration on the left)
interface TimelineDateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineDate = React.forwardRef<HTMLDivElement, TimelineDateProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-sm font-medium text-gray-500 dark:text-gray-400",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineDate.displayName = "TimelineDate";

// Timeline Title
interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const TimelineTitle = React.forwardRef<HTMLHeadingElement, TimelineTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-lg font-semibold text-gray-900 dark:text-white transition-colors",
          "group-hover/item:text-brand-lime",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
TimelineTitle.displayName = "TimelineTitle";

// Timeline Content
interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineContent.displayName = "TimelineContent";

export {
  Timeline,
  TimelineItem,
  TimelineHeader,
  TimelineSeparator,
  TimelineIndicator,
  TimelineDate,
  TimelineTitle,
  TimelineContent,
};
