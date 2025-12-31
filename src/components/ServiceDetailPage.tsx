import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { services } from '../data/services';
import { industries } from '../data/industries';
import { Service, Industry } from '../types';
import CheckmarkIcon from './icons/CheckmarkIcon';

const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Combine services and industries to find the matching item
  // Type assertion needed because TypeScript might not infer that both arrays contain items with potential slugs
  const allItems = [...services, ...industries] as (Service | Industry)[];
  const item = allItems.find(s => s.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!item) {
    return <Navigate to="/" replace />;
  }

  const { title, details, icon: Icon } = item;

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Breadcrumb / Back Link */}
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-lime mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
          <div className="p-4 bg-brand-lime/10 dark:bg-brand-lime/[0.08] rounded-2xl">
            <Icon className="w-16 h-16 text-brand-lime" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              {title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
              {details?.fullDescription || item.description}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Benefits & Features */}
          <div className="space-y-12">
             {/* Key Benefits */}
             {details?.benefits && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Benefits</h2>
                <ul className="space-y-4">
                  {details.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-brand-lime/20 flex items-center justify-center">
                        <CheckmarkIcon className="w-3 h-3 text-brand-lime" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Core Capabilities (Features) */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Core Capabilities</h2>
              <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] rounded-2xl p-6 sm:p-8">
                <ul className="space-y-3">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-lime"></div>
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Right Column: Process & CTA */}
          <div className="space-y-12">
             {/* Our Process */}
             {details?.process && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
                <div className="space-y-6">
                  {details.process.map((step, idx) => {
                    const [stepTitle, stepDesc] = step.split(':');
                    return (
                      <div key={idx} className="relative pl-8 border-l border-gray-200 dark:border-gray-800 last:border-0 pb-6 last:pb-0">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-brand-lime border-4 border-white dark:border-gray-950"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {stepTitle}
                        </h3>
                        {stepDesc && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {stepDesc.trim()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* CTA Box */}
            <div className="bg-brand-lime text-gray-900 rounded-3xl p-8 shadow-glow-lime relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              
              <h3 className="text-2xl font-bold mb-4 relative z-10">Ready to automate?</h3>
              <p className="mb-8 text-gray-800/90 relative z-10 font-medium">
                Let's discuss how {title} can transform your operations. Book a free consultation today.
              </p>
              
              <Link 
                to="/#contact" 
                onClick={(e) => {
                    // Start navigation to home
                    // We'll rely on the Home page to check the hash and scroll
                    // But standard anchor links on different routes might just jump.
                    // Ideally, we navigate to home then scroll.
                    // For now, simple to="/#contact" usually requires handling on the landing page if it's SPA
                    // But react-router-hash-link is better, or a simple useEffect in LandingPage
                }}
                className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-colors shadow-lg relative z-10"
              >
                Get Started
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
