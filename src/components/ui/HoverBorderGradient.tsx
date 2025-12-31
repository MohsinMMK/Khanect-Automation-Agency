"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "div",
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  // Using brand-lime color (#14B8A6) for the gradient
  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, #14B8A6 0%, rgba(20, 184, 166, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, #14B8A6 0%, rgba(20, 184, 166, 0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, #14B8A6 0%, rgba(20, 184, 166, 0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, #14B8A6 0%, rgba(20, 184, 166, 0) 100%)",
  };

  const highlight =
    "radial-gradient(75% 181.15% at 50% 50%, #14B8A6 0%, rgba(20, 184, 166, 0) 100%)";

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex flex-col p-[2px] overflow-hidden transition duration-500",
        containerClassName
      )}
      {...props}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          filter: "blur(2px)",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      {/* Inner content with background */}
      <div
        className={cn(
          "relative z-10 flex-1 min-h-0 w-full rounded-[inherit] bg-white dark:bg-[#0f0f11] flex flex-col",
          className
        )}
      >
        {children}
      </div>
    </Tag>
  );
}

export default HoverBorderGradient;
