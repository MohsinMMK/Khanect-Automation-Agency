import React from 'react';

interface IconProps {
  className?: string;
}

const WorkflowIcon: React.FC<IconProps> = ({ className = "" }) => (
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
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6"/>
    <path d="M17 7l-2.5 2.5M9.5 14.5L7 17"/>
    <path d="M7 7l2.5 2.5m5 5L17 17"/>
    <circle cx="18" cy="18" r="2"/>
    <circle cx="6" cy="6" r="2"/>
    <circle cx="18" cy="6" r="2"/>
    <circle cx="6" cy="18" r="2"/>
  </svg>
);

export default WorkflowIcon;
