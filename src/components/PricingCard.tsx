import React from 'react';
import CheckmarkIcon from './icons/CheckmarkIcon';

interface PricingCardProps {
  title: string;
  price: number | string;
  period: string;
  features: string[];
  targetAudience: string;
  isPopular?: boolean;
  onCTAClick: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  features,
  targetAudience,
  isPopular = false,
  onCTAClick
}) => {
  return (
    <div className={`
      glass-card p-8 rounded-3xl relative transition-all duration-300 ease-out flex flex-col w-full
      ${isPopular
        ? 'border-brand-lime/50 border shadow-glow-lime'
        : 'hover:-translate-y-1'
      }
    `}>
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-lime text-black px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
          Most Popular
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
          {title}
        </h3>

        <div className="mb-3">
          {typeof price === 'number' ? (
            <>
              <span className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                ${price}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                /{period}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {price}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          {targetAudience}
        </p>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
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

      <button
        onClick={onCTAClick}
        className={`
          w-full py-3.5 rounded-xl font-semibold transition-all duration-180
          ${isPopular
            ? 'btn-primary justify-center'
            : 'btn-secondary justify-center'
          }
        `}
      >
        Get Started
      </button>
    </div>
  );
};

export default PricingCard;
