import React from 'react';
import CalendarIcon from './icons/CalendarIcon';

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  duration: string;
  isLast?: boolean;
}

const ProcessStep: React.FC<ProcessStepProps> = ({
  number,
  title,
  description,
  duration,
  isLast = false
}) => {
  return (
    <div className="relative">
      <div className="glass-card p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-500 ease-fluid hover:-translate-y-2 hover:shadow-xl h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-brand-lime rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-brand-lime/30">
            {number}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>

            <div className="inline-flex items-center gap-1.5 bg-brand-lime/10 text-brand-lime px-3 py-1 rounded-full text-xs font-medium mb-3">
              <CalendarIcon />
              <span>{duration}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>

      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-brand-lime/30" />
      )}
    </div>
  );
};

export default ProcessStep;
