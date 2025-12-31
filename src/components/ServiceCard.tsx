import React from 'react';
import CheckCircleIcon from './icons/CheckCircleIcon';

import { Link } from 'react-router-dom';

interface ServiceCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
  slug?: string;
  category?: 'services' | 'industries';
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon: IconComponent, title, description, features, slug = '', category = 'services' }) => {
  return (
    <div className="bg-transparent border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-white/[0.1] p-7 pt-8 sm:pt-7 sm:pl-8 group cursor-default flex flex-col">
      {/* Icon Container */}
      <div className="w-12 h-12 bg-brand-lime/10 dark:bg-brand-lime/[0.08] rounded-xl flex items-center justify-center text-brand-lime mb-5">
        <IconComponent />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5">
        {description}
      </p>

      {/* Features List */}
      <ul className="space-y-3 mb-6 flex-1">
        {features.map((feature, index) => (
          <li key={`${title}-feature-${index}`} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircleIcon className="text-brand-lime w-5 h-5" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link 
        to={`/${category}/${slug}`}
        className="mt-auto w-fit px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/[0.2] rounded-lg hover:border-gray-500 dark:hover:border-white/40 transition-colors duration-200"
      >
        Learn more
      </Link>
    </div>
  );
};

export default ServiceCard;
