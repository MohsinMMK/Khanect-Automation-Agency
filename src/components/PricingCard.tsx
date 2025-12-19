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
      glass-card p-8 rounded-2xl relative transition-all duration-500 ease-fluid flex flex-col w-full
      ${isPopular
        ? 'border-brand-lime border-2 shadow-2xl shadow-brand-lime/20'
        : 'hover:border-brand-lime/50 hover:-translate-y-2 hover:shadow-xl'
      }
    `}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-lime text-black px-4 py-1 rounded-full text-xs font-bold uppercase">
          Most Popular
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>

        <div className="mb-2">
          {typeof price === 'number' ? (
            <>
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ${price}
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                /{period}
              </span>
            </>
          ) : (
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
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
              <CheckmarkIcon className="text-brand-lime" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCTAClick}
        className={`
          w-full py-3 rounded-lg font-bold transition-all duration-300 ease-fluid hover:scale-105 active:scale-95
          ${isPopular
            ? 'bg-brand-lime hover:bg-brand-limeHover text-black shadow-lg shadow-brand-lime/20'
            : 'border-2 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:border-brand-lime hover:text-brand-lime'
          }
        `}
      >
        Get Started
      </button>
    </div>
  );
};

export default PricingCard;
