import React from 'react';

interface IconProps {
  className?: string;
}

const LeadGenIcon: React.FC<IconProps> = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v6"/>
    <path d="M12 18v4"/>
    <path d="m4.93 4.93 4.24 4.24"/>
    <path d="m14.83 14.83 4.24 4.24"/>
    <path d="M2 12h6"/>
    <path d="M16 12h6"/>
    <path d="m4.93 19.07 4.24-4.24"/>
    <path d="m14.83 9.17 4.24-4.24"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default LeadGenIcon;
