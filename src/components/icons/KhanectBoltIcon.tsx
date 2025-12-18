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
      {/* Solid vertical bar */}
      <rect x="4" y="2" width="5" height="28" className={fillClassName} />

      {/* Chevrons */}
      <polygon points="11,2 17,8 17,11 11,5" className={fillClassName} />
      <polygon points="14,2 20,8 20,11 14,5" className={fillClassName} />
      <polygon points="17,2 23,8 23,11 17,5" className={fillClassName} />
      <polygon points="20,2 26,8 26,11 20,5" className={fillClassName} />

      {/* Circuit line 1 with nodes */}
      <line x1="9" y1="13" x2="19" y2="23" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={fillClassName} />
      <circle cx="9" cy="13" r="2" className={fillClassName} />
      <circle cx="19" cy="23" r="2" className={fillClassName} />

      {/* Circuit line 2 with nodes */}
      <polyline points="9,18 15,24 25,30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" className={fillClassName} />
      <circle cx="9" cy="18" r="2" className={fillClassName} />
      <circle cx="15" cy="24" r="2" className={fillClassName} />
    </svg>
  );
};

export default KhanectBoltIcon;
