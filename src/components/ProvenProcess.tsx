import React from 'react';
import { processSteps } from '../data/process';

// SVG icons for each step
const StepIcon: React.FC<{ step: number }> = ({ step }) => {
  const iconClass = "w-5 h-5";

  switch (step) {
    case 1: // Discovery - Search
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" strokeWidth="2"/>
          <path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35"/>
        </svg>
      );
    case 2: // Audit - Clipboard
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
        </svg>
      );
    case 3: // Development - Settings/Cog
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      );
    case 4: // Testing - Check Circle
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      );
    case 5: // Deployment - Rocket
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
        </svg>
      );
    case 6: // Support - Chat
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      );
    default:
      return <span className="font-bold">{step}</span>;
  }
};

const ProvenProcess: React.FC = () => {
  return (
    <section id="process" className="py-24 lg:py-32 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
            Our Proven Process
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            From discovery to deployment, we guide you every step of the way
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {processSteps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex gap-6 pb-12 last:pb-0 group"
            >
              {/* Left Column - Duration (desktop only) */}
              <div className="hidden sm:flex w-28 flex-shrink-0 justify-end pt-2">
                <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full h-fit">
                  <svg className="w-4 h-4 text-brand-lime flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{step.duration}</span>
                </div>
              </div>

              {/* Center Column - Icon & Line */}
              <div className="relative flex flex-col items-center">
                {/* The connecting line */}
                {index < processSteps.length - 1 && (
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%-24px)] bg-gradient-to-b from-brand-lime/60 to-brand-lime/20" />
                )}
                
                {/* The icon indicator */}
                <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-lime shadow-lg shadow-brand-lime/30 text-black transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-brand-lime/40">
                  <StepIcon step={step.number} />
                </div>
              </div>

              {/* Right Column - Content */}
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors group-hover:text-brand-lime">
                  {step.title}
                </h3>
                
                {/* Duration shown inline on mobile */}
                <div className="sm:hidden mb-3">
                  <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-brand-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{step.duration}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProvenProcess;
