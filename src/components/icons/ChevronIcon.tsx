import React from 'react';

interface IconProps {
  className?: string;
}

const ChevronIcon: React.FC<IconProps> = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default ChevronIcon;
