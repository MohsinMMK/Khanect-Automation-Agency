import React from 'react';

interface KhanectBoltIconProps {
  size?: number;
  className?: string;
  fillClassName?: string;
  strokeClassName?: string;
}

/**
 * Unique Khanect "K" logo icon
 * Geometric K design with angular stripes
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
      {/* Vertical bar of K */}
      <path
        d="M4 2H7V22H4V2Z"
        className={fillClassName}
      />
      {/* Upper diagonal */}
      <path
        d="M7 10L14 2H18L9 12L7 10Z"
        className={fillClassName}
      />
      {/* Middle diagonal */}
      <path
        d="M7 14L16 4H20L9 16L7 14Z"
        className={fillClassName}
      />
      {/* Lower diagonal */}
      <path
        d="M9 12L20 22H16L7 14L9 12Z"
        className={fillClassName}
      />
      {/* Bottom diagonal */}
      <path
        d="M9 16L18 22H14L7 18L9 16Z"
        className={fillClassName}
      />
    </svg>
  );
};

export default KhanectBoltIcon;
