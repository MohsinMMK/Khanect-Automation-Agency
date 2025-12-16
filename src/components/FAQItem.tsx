import React from 'react';
import ChevronIcon from './icons/ChevronIcon';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-6 text-left transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {question}
        </h3>

        <div className={`
          flex-shrink-0 transition-transform duration-300 text-gray-600 dark:text-gray-400
          ${isOpen ? 'rotate-180' : ''}
        `}>
          <ChevronIcon />
        </div>
      </button>

      <div className={`
        transition-all duration-300 ease-fluid overflow-hidden
        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-6 pb-6 pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQItem;
