import React from 'react';

interface KhanectBoltIconProps {
  size?: number;
  className?: string;
  fillClassName?: string;
  strokeClassName?: string;
}

/**
 * Unique Khanect lightning bolt icon with connection node
 * Represents power + connectivity (Khanect = Connect)
 */
const KhanectBoltIcon: React.FC<KhanectBoltIconProps> = ({
  size = 24,
  className = '',
  fillClassName = 'fill-brand-lime',
  strokeClassName = 'stroke-brand-lime'
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
      {/* Main lightning bolt - unique angular design */}
      <path
        d="M14.5 2L6 13H11L9 22L18 11H13L14.5 2Z"
        className={fillClassName}
        strokeWidth="0"
      />
      {/* Connection node at the strike point */}
      <circle
        cx="13.5"
        cy="11"
        r="2"
        className={`${fillClassName} ${strokeClassName}`}
        strokeWidth="1.5"
      />
      {/* Energy arc lines */}
      <path
        d="M4 11C4 11 5.5 9 6 9"
        className={strokeClassName}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 13C18 13 19.5 11 20 11"
        className={strokeClassName}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default KhanectBoltIcon;
