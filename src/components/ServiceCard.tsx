import React from 'react';
import CheckmarkIcon from './icons/CheckmarkIcon';

interface ServiceCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon: IconComponent, title, description, features }) => {
  return (
    <div className="glass-card p-8 rounded-3xl group cursor-default transition-all duration-300 ease-out hover:-translate-y-1">
      {/* Icon Container */}
      <div className="w-11 h-11 bg-brand-lime/10 dark:bg-brand-lime/[0.08] rounded-xl flex items-center justify-center text-brand-lime mb-6 transition-all duration-300 group-hover:bg-brand-lime group-hover:text-gray-900">
        <IconComponent />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
        {description}
      </p>

      {/* Features List */}
      <ul className="space-y-2.5">
        {features.map((feature, index) => (
          <li key={`${title}-feature-${index}`} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <CheckmarkIcon className="text-brand-lime w-4 h-4" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCard;
