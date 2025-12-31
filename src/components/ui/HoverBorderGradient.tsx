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
        "relative flex content-center transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-full",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-full h-full z-10 rounded-[inherit]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        style={{
          filter: "blur(3px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      {/* Inner background - matches glass3d */}
      <div className="absolute z-[1] flex-none inset-[2px] rounded-[inherit] bg-white/95 dark:bg-[#0f0f11]/95 backdrop-blur-xl" />
    </Tag>
  );
}

export default HoverBorderGradient;
