"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

// Duration bounds for animation (in seconds)
const MIN_DURATION = 0.5;
const MAX_DURATION = 4;
const CHAR_DURATION = 0.02;
const WORD_DURATION = 0.08;

export function useAnimatedText(text: string, delimiter: string = "") {
  const [cursor, setCursor] = useState(0);
  const [startingCursor, setStartingCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);

  if (prevText !== text) {
    setPrevText(text);
    setStartingCursor(text.startsWith(prevText) ? cursor : 0);
  }

  useEffect(() => {
    const parts = text.split(delimiter);
    const partCount = parts.length - startingCursor;

    // Calculate duration based on content length with min/max bounds
    const perPartDuration = delimiter === "" ? CHAR_DURATION : WORD_DURATION;
    const calculatedDuration = partCount * perPartDuration;
    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, calculatedDuration));

    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [startingCursor, text, delimiter]);

  return text.split(delimiter).slice(0, cursor).join(delimiter);
}
