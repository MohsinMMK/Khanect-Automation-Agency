import React, { useState } from 'react';
import { ViewState } from '../types';
import PricingCard from './PricingCard';
import FAQItem from './FAQItem';
import { pricingPackages } from '../data/pricing';

interface PricingProps {
  onNavigate: (view: ViewState) => void;
}

const Pricing: React.FC<PricingProps> = ({ onNavigate }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleStartFreeTrial = () => {
    onNavigate(ViewState.LANDING);
    // Scroll to contact form after navigation
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const pricingFAQs = [
    {
      id: 1,
      question: 'Can I change plans at any time?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the billing.'
    },
    {
      id: 2,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans.'
    },
    {
      id: 3,
      question: 'Is there a setup fee?',
      answer: 'No setup fees for any plan. We believe in transparent pricing with no hidden costs.'
    },
    {
      id: 4,
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.'
    },
    {
      id: 5,
      question: 'Can I get a custom plan?',
      answer: 'Absolutely! Enterprise clients can work with us to create a fully customized plan that fits their exact needs.'
    }
  ];

  return (
    <div className="min-h-screen pt-24 md:pt-32 lg:pt-40 pb-12 md:pb-20 lg:pb-24">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 mb-12 md:mb-16 lg:mb-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-lime/10 dark:bg-brand-lime/5 border border-brand-lime/20 mb-6 md:mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Flexible Pricing Plans</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white leading-tight">
            Simple, Transparent
            <span className="block mt-2">
              <span className="relative inline-block">
                <span className="relative z-10">Pricing</span>
                <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-2 md:h-3 bg-brand-lime/30 dark:bg-brand-lime/20 -rotate-1 z-0"></span>
              </span>
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed">
            Choose the perfect plan to scale your automation journey. All plans include our core features with flexible customization options.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>14-day trial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 mb-16 md:mb-20 lg:mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-stretch">
            {pricingPackages.map(pkg => (
              <div key={pkg.id} className="flex">
                <PricingCard
                  {...pkg}
                  onCTAClick={handleStartFreeTrial}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="px-4 sm:px-6 mb-16 md:mb-20 lg:mb-24 bg-gray-50/50 dark:bg-brand-card/30 py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Compare All Features
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every plan is designed to grow with your business needs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] bg-white dark:bg-black/40 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Features</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Starter</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    <div className="flex items-center justify-center gap-2">
                      Growth
                      <span className="px-2 py-0.5 bg-brand-lime text-black text-xs font-bold rounded-full">Popular</span>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Scale</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {[
                  { feature: 'Workflow Automations', values: ['Up to 3', 'Up to 7', 'Up to 15', 'Unlimited'] },
                  { feature: 'CRM Integration', values: ['Basic', 'Advanced', 'Full Ecosystem', 'Multi-department'] },
                  { feature: 'AI Chatbot', values: ['—', '✓', 'Custom + KB', 'Custom Dev'] },
                  { feature: 'Lead Generation', values: ['—', 'Automation', 'Complete System', 'Custom'] },
                  { feature: 'Support', values: ['24/7', '24/7', '24/7', '24/7'] },
                  { feature: 'Strategy Calls', values: ['—', 'Monthly', 'Bi-weekly', 'Quarterly Reviews'] },
                  { feature: 'Customer Portal', values: ['—', '—', '✓', '✓'] },
                  { feature: 'Dedicated Engineer', values: ['—', '—', '—', '✓'] },
                  { feature: 'SLA Guarantees', values: ['—', '—', '—', '✓'] },
                  { feature: 'Documentation & Training', values: ['✓', '✓', '✓', '✓'] },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.feature}</td>
                    {row.values.map((value, i) => (
                      <td key={i} className="px-4 sm:px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        {value === '✓' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime mx-auto">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 mb-16 md:mb-20 bg-gray-50/50 dark:bg-brand-card/30 py-12 md:py-16 lg:py-20 transition-colors duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white transition-colors">
              Pricing FAQs
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 transition-colors">
              Common questions about our pricing plans
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {pricingFAQs.map(faq => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === faq.id}
                onToggle={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6">
        <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 rounded-2xl md:rounded-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses already automating their workflows with Khanect AI
          </p>
          <button
            onClick={handleStartFreeTrial}
            className="px-10 py-4 bg-brand-lime text-black rounded-xl font-bold text-lg transition-all duration-300 ease-fluid hover:bg-brand-limeHover hover:scale-105 active:scale-95 shadow-lg shadow-brand-lime/20 hover:shadow-[0_10px_40px_-10px_rgba(211,243,107,0.6)] touch-manipulation"
          >
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
