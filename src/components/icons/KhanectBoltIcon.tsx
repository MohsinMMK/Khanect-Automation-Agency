import React from 'react';

interface KhanectBoltIconProps {
  size?: number;
  className?: string;
  fillClassName?: string;
  strokeClassName?: string;
}

/**
 * Khanect "K" logo icon
 * Tech/circuit-inspired K with chevrons and connection nodes
 */
const KhanectBoltIcon: React.FC<KhanectBoltIconProps> = ({
  size = 24,
  className = '',
  fillClassName = 'fill-brand-lime',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Vertical bar with triangular cutout */}
      <path
        d="M3 2H7V8L3 4V2ZM3 4L7 8V22H3V4Z"
        className={fillClassName}
        fillRule="evenodd"
      />

      {/* Top chevron stripes */}
      <path d="M9 2L15 8L13 10L7 4L9 2Z" className={fillClassName} />
      <path d="M11 2L17 8L15 10L9 4L11 2Z" className={fillClassName} />
      <path d="M13 2L19 8L17 10L11 4L13 2Z" className={fillClassName} />
      <path d="M15 2L21 8L19 10L13 4L15 2Z" className={fillClassName} />

      {/* Circuit line with nodes - upper */}
      <path d="M7 10L14 17" stroke="currentColor" className={fillClassName} strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1.5" className={fillClassName} />
      <circle cx="13" cy="16" r="1.5" className={fillClassName} />

      {/* Circuit line with nodes - lower */}
      <path d="M7 14L12 19L18 22" stroke="currentColor" className={fillClassName} strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="15" r="1.5" className={fillClassName} />
      <circle cx="12" cy="19" r="1.5" className={fillClassName} />
    </svg>
  );
};

export default KhanectBoltIcon;
