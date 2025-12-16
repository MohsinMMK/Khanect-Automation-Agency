import React from 'react';
import CheckmarkIcon from './icons/CheckmarkIcon';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, features }) => {
  return (
    <div className="glass-card p-8 rounded-2xl group cursor-default hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-500 ease-fluid hover:-translate-y-2 hover:shadow-xl hover:border-brand-lime/50">
      <div className="w-12 h-12 bg-brand-lime/10 rounded-lg flex items-center justify-center text-brand-lime mb-6 transition-all duration-500 ease-fluid group-hover:scale-110 group-hover:bg-brand-lime group-hover:text-black">
        {icon}
      </div>

      <h3 className="text-2xl font-semibold mb-3 transition-colors text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 transition-colors">
        {description}
      </p>

      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={`${title}-feature-${index}`} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <CheckmarkIcon className="text-brand-lime" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCard;
