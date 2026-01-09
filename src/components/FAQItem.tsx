import React, { useId } from 'react';
import ChevronIcon from './icons/ChevronIcon';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {
  const answerId = useId();

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.06] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-6 text-left group"
        aria-expanded={isOpen}
        aria-controls={answerId}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-180 group-hover:text-brand-lime">
          {question}
        </h3>

        <div
          className={`
            flex-shrink-0 transition-all duration-300 ease-out text-gray-400 dark:text-gray-500
            group-hover:text-brand-lime
            ${isOpen ? 'rotate-180 text-brand-lime' : ''}
          `}
          aria-hidden="true"
        >
          <ChevronIcon />
        </div>
      </button>

      <div
        id={answerId}
        role="region"
        aria-hidden={!isOpen}
        className={`
          grid transition-all duration-300 ease-out
          ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
        `}
      >
        <div className="overflow-hidden">
          <p className="pb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQItem;
