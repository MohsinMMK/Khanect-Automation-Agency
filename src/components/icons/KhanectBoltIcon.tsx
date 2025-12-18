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
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Vertical bar */}
      <rect x="5" y="3" width="4" height="26" className={fillClassName} />

      {/* Top chevrons */}
      <path d="M12 3L18 9L16 11L10 5Z" className={fillClassName} />
      <path d="M15 3L21 9L19 11L13 5Z" className={fillClassName} />
      <path d="M18 3L24 9L22 11L16 5Z" className={fillClassName} />
      <path d="M21 3L27 9L25 11L19 5Z" className={fillClassName} />

      {/* Upper circuit line with nodes */}
      <line x1="9" y1="12" x2="18" y2="21" className={`stroke-current ${fillClassName}`} strokeWidth="3" strokeLinecap="round" />
      <circle cx="10" cy="13" r="2.5" className={fillClassName} />
      <circle cx="17" cy="20" r="2.5" className={fillClassName} />

      {/* Lower circuit line with nodes */}
      <line x1="9" y1="17" x2="16" y2="24" className={`stroke-current ${fillClassName}`} strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="24" x2="24" y2="28" className={`stroke-current ${fillClassName}`} strokeWidth="3" strokeLinecap="round" />
      <circle cx="10" cy="18" r="2.5" className={fillClassName} />
      <circle cx="16" cy="24" r="2.5" className={fillClassName} />
    </svg>
  );
};

export default KhanectBoltIcon;
