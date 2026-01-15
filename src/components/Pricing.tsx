import React from 'react';
import { ViewState } from '../types';
import PricingCard from './PricingCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StaggerContainer from './StaggerContainer';
import { pricingPackages } from '../data/pricing';
import { useStructuredData } from '../hooks/useStructuredData';
import {
  generateOrganizationSchema,
  generatePricingSchema,
  generateBreadcrumbSchema,
  combineSchemas
} from '../utils/structuredData';

interface PricingProps {
  onNavigate: (view: ViewState) => void;
}

const Pricing: React.FC<PricingProps> = ({ onNavigate }) => {

  // Structured data for SEO rich snippets
  useStructuredData(
    combineSchemas(
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Pricing', url: '/pricing' }
      ]),
      ...generatePricingSchema(pricingPackages)
    ),
    'pricing-page'
  );

  const handleStartFreeTrial = () => {
    onNavigate(ViewState.LANDING);
    // Wait for view change, DOM update, and scroll reset, then scroll to contact form
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
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
    <div className="min-h-screen pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-24 lg:pb-32">
      {/* Hero Section */}
      <section className="px-6 mb-16 md:mb-20 lg:mb-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-lime/10 dark:bg-brand-lime/[0.08] border border-brand-lime/20 dark:border-brand-lime/15 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Flexible Pricing Plans</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
            Simple, Transparent{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Pricing</span>
              <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-2 md:h-3 bg-brand-lime/30 dark:bg-brand-lime/20 -rotate-1 z-0"></span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Choose the perfect plan to scale your automation journey. All plans include our core features with flexible customization options.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>14-day trial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 mb-24 md:mb-32">
        <div className="max-w-7xl mx-auto">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 items-stretch">
            {pricingPackages.map(pkg => (
              <div key={pkg.id} className="flex">
                <PricingCard
                  {...pkg}
                  onCTAClick={handleStartFreeTrial}
                />
              </div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="px-6 py-24 lg:py-32 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight">
              Compare All Features
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Every plan is designed to grow with your business needs
            </p>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-6">
            {[
              { name: 'Starter', features: { 'Workflow Automations': 'Up to 3', 'CRM Integration': 'Basic', 'AI Chatbot': '—', 'Lead Generation': '—', 'Support': '24/7' } },
              { name: 'Growth', popular: true, features: { 'Workflow Automations': 'Up to 7', 'CRM Integration': 'Advanced', 'AI Chatbot': '✓', 'Lead Generation': 'Automation', 'Support': '24/7' } },
              { name: 'Scale', features: { 'Workflow Automations': 'Up to 15', 'CRM Integration': 'Full Ecosystem', 'AI Chatbot': 'Custom + KB', 'Lead Generation': 'Complete System', 'Support': '24/7' } },
              { name: 'Enterprise', features: { 'Workflow Automations': 'Unlimited', 'CRM Integration': 'Multi-department', 'AI Chatbot': 'Custom Dev', 'Lead Generation': 'Custom', 'Support': '24/7' } },
            ].map((plan) => (
              <div key={plan.name} className={`glass-card p-6 rounded-2xl ${plan.popular ? 'ring-2 ring-brand-lime' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  {plan.popular && (
                    <span className="px-2.5 py-1 bg-brand-lime text-black text-xs font-semibold rounded-full">Popular</span>
                  )}
                </div>
                <ul className="space-y-3">
                  {Object.entries(plan.features).map(([feature, value]) => (
                    <li key={feature} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {value === '✓' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[800px] bg-white dark:bg-white/[0.03] rounded-3xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
              <thead className="bg-gray-50/80 dark:bg-white/[0.04]">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-900 dark:text-white">Features</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-900 dark:text-white">Starter</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    <div className="flex items-center justify-center gap-2">
                      Growth
                      <span className="px-2.5 py-1 bg-brand-lime text-black text-xs font-semibold rounded-full">Popular</span>
                    </div>
                  </th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-900 dark:text-white">Scale</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-900 dark:text-white">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
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
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors duration-180">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.feature}</td>
                    {row.values.map((value, i) => (
                      <td key={i} className="px-6 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                        {value === '✓' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime mx-auto">
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
      <section className="px-6 py-24 lg:py-32 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight">
              Pricing FAQs
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Common questions about our pricing plans
            </p>
          </div>

          <Accordion className="space-y-4" type="single" collapsible>
            {pricingFAQs.map(faq => (
              <AccordionItem key={faq.id} value={String(faq.id)}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 lg:py-32">
        <div className="max-w-3xl mx-auto glass-card p-10 md:p-14 rounded-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
            Join hundreds of businesses already automating their workflows<br className="hidden sm:inline" /> with Khanect&nbsp;AI
          </p>
          <button
            onClick={handleStartFreeTrial}
            className="btn-primary text-lg px-10 py-4"
          >
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
