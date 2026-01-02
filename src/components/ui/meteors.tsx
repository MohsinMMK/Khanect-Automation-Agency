import { cn } from "@/lib/utils";
import React from "react";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 12).fill(true);
  return (
    <>
      {meteors.map((el, idx) => {
        // Weighted random - 80% at top, 20% at middle
        const topPos = Math.floor(Math.pow(Math.random(), 3) * 200);
        // Opacity decreases as position goes lower (100% at top, 55% at middle)
        const meteorOpacity = 1 - (topPos / 200) * 0.9;

        return (
          <span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[200deg]",
              "before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-translate-x-full before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-transparent before:to-[#64748b]",
              className
            )}
            style={{
              top: topPos + "px",
              left: Math.floor(Math.random() * 800 - 400) + "px",
              opacity: meteorOpacity,
              animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
              animationDuration: Math.floor(Math.random() * (8 - 2) + 2) + "s",
            }}
          ></span>
        );
      })}
    </>
  );
};

export default Meteors;
