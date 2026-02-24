"use client";

import { useEffect, useRef, useState } from "react";

interface ClampTextProps {
  text: string;
  lines?: number;
  moreLabel?: string;
  lessLabel?: string;
  className?: string;
}

export const ClampText = ({
  text,
  lines = 2,
  moreLabel = "Показать больше",
  lessLabel = "Свернуть",
  className = "",
}: ClampTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [clampedText, setClampedText] = useState<string | null>(null);
  const clampMeasurerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const container = clampMeasurerRef.current;
    if (!container) return;

    container.innerText = text;
    const lineHeight = parseFloat(getComputedStyle(container).lineHeight) || 16;
    const maxHeight = lineHeight * lines;

    if (container.scrollHeight <= maxHeight) {
      setClampedText(null);
      return;
    }

    let left = 0;
    let right = text.length;
    let bestFit = "";

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const testText = text.slice(0, mid) + "… " + moreLabel;
      container.innerText = testText;

      if (container.scrollHeight <= maxHeight) {
        bestFit = text.slice(0, mid);
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    setClampedText(bestFit ? bestFit.trim() + "…" : null);
  }, [text, lines, moreLabel]);

  return (
    <>
      {/* Hidden measurer */}
      <div className="relative w-full">
        <p
          ref={clampMeasurerRef}
          className="invisible absolute top-0 left-0 z-10 h-auto w-full text-[14px] leading-5 font-normal break-words whitespace-pre-wrap select-none"
        >
          {text}
        </p>
      </div>

      {/* Visible text */}
      {isExpanded || !clampedText ? (
        <p
          className={`m-0 text-[14px] leading-5 break-words whitespace-pre-wrap text-foreground ${className}`}
        >
          {text}{" "}
          {clampedText && (
            <span
              className="text-muted-foreground cursor-pointer font-medium underline select-none"
              onClick={() => setIsExpanded(false)}
            >
              {lessLabel}
            </span>
          )}
        </p>
      ) : (
        <p
          className={`m-0 text-[14px] leading-5 break-words whitespace-pre-wrap text-foreground ${className}`}
        >
          {clampedText}{" "}
          <span
            className="text-muted-foreground cursor-pointer font-medium underline select-none"
            onClick={() => setIsExpanded(true)}
          >
            {moreLabel}
          </span>
        </p>
      )}
    </>
  );
};
