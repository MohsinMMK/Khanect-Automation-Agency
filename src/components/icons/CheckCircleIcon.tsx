import React from 'react';

interface IconProps {
  className?: string;
  circleClassName?: string;
}

const CheckCircleIcon: React.FC<IconProps> = ({ 
  className = "",
  circleClassName = "fill-brand-lime/15 dark:fill-brand-lime/20" 
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <circle cx="12" cy="12" r="10" className={circleClassName} />
    <path 
      d="M8.5 12.5L10.5 14.5L15.5 9.5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default CheckCircleIcon;
