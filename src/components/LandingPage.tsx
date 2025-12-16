import React, { useState } from 'react';
import { ViewState } from '../types';
import { getEnv } from '../utils/env';
import { validateEmail, validatePhone, validateUrl, validateName } from '../utils/validation';
import { supabase } from '../lib/supabase';
import TabSwitch from './TabSwitch';
import ServiceCard from './ServiceCard';
import PricingCard from './PricingCard';
import ProcessStep from './ProcessStep';
import FAQItem from './FAQItem';
import { services } from '../data/services';
import { industries } from '../data/industries';
import { pricingPackages } from '../data/pricing';
import { processSteps } from '../data/process';
import { faqs } from '../data/faqs';

// n8n Webhook URL
const N8N_WEBHOOK_URL = getEnv('VITE_N8N_WEBHOOK_URL');

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  website?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'services' | 'industries'>('services');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const validateField = (fieldName: keyof FormData, value: string): string | undefined => {
    switch (fieldName) {
      case 'fullName':
        const nameResult = validateName(value, 'Full name');
        return nameResult.isValid ? undefined : nameResult.error;

      case 'email':
        const emailResult = validateEmail(value);
        return emailResult.isValid ? undefined : emailResult.error;

      case 'phone':
        const phoneResult = validatePhone(value);
        return phoneResult.isValid ? undefined : phoneResult.error;

      case 'businessName':
        const businessResult = validateName(value, 'Business name');
        return businessResult.isValid ? undefined : businessResult.error;

      case 'website':
        const urlResult = validateUrl(value);
        return urlResult.isValid ? undefined : urlResult.error;

      default:
        return undefined;
    }
  };

  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id as keyof FormData;

    // Update form data
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    // Validate field if it has been touched
    if (touchedFields.has(fieldName)) {
      const error = validateField(fieldName, value);
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id as keyof FormData;

    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(fieldName));

    // Validate on blur
    const error = validateField(fieldName, value);
    setFormErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    const baseClasses = "w-full bg-gray-50 dark:bg-black/40 border rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none transition-all duration-300 focus:ring-1";

    const hasError = touchedFields.has(fieldName) && formErrors[fieldName];

    if (hasError) {
      return `${baseClasses} border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/50`;
    }

    return `${baseClasses} border-gray-300 dark:border-white/10 focus:border-brand-lime focus:ring-brand-lime/50`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const errors: FormErrors = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      businessName: validateField('businessName', formData.businessName),
      website: validateField('website', formData.website),
    };

    // Mark all fields as touched
    setTouchedFields(new Set(['fullName', 'email', 'phone', 'businessName', 'website']));

    // Check if any errors exist
    const hasErrors = Object.values(errors).some(error => error !== undefined);

    if (hasErrors) {
      setFormErrors(errors);
      setSubmitStatus('error');
      setErrorMessage('Please fix the errors above before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setFormErrors({});

    try {
      let supabaseId = `backup-id-${Date.now()}`;
      let supabaseSuccess = false;

      // 1. Save to Supabase
      if (supabase) {
        try {
          const { data: supabaseData, error: supabaseError } = await supabase
            .from('contact_submissions')
            .insert([{
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              business_name: formData.businessName,
              website: formData.website || null,
            }])
            .select()
            .single();

          if (supabaseError) {
            console.error('Supabase error:', supabaseError);
            // If RLS policy is still not fixed, provide helpful error
            if (supabaseError.message.includes('policy')) {
              throw new Error('Database configuration error. Please contact support.');
            }
            throw new Error('Failed to save your submission. Please try again.');
          } else if (supabaseData) {
            supabaseId = supabaseData.id;
            supabaseSuccess = true;
          }
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          throw dbErr;
        }
      } else {
        console.warn('Supabase not configured. Skipping database save.');
        // In production, this should be an error
        if (!import.meta.env.DEV) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        }
      }

      // 2. Send webhook notification
      let webhookSuccess = false;
      if (N8N_WEBHOOK_URL && N8N_WEBHOOK_URL.startsWith('http')) {
        try {
          const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: supabaseId,
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              businessName: formData.businessName,
              website: formData.website,
              submittedAt: new Date().toISOString(),
            }),
          });

          if (!webhookResponse.ok) {
            console.warn('Webhook failed:', webhookResponse.status);
            // Don't fail the entire submission if webhook fails
          } else {
            webhookSuccess = true;
          }
        } catch (webhookErr) {
          console.warn('Webhook error:', webhookErr);
          // Don't fail the entire submission if webhook fails
        }
      }

      // Require at least one backend to succeed
      if (!supabaseSuccess && !webhookSuccess) {
        throw new Error('Unable to process your submission. Please try again.');
      }

      // Success!
      setSubmitStatus('success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        businessName: '',
        website: '',
      });
      setFormErrors({});
      setTouchedFields(new Set());

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="relative pt-28 md:pt-40 pb-12 md:pb-20 px-6 min-h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left Content */}
          <div className="text-left">
            


            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.95] text-gray-900 dark:text-white transition-colors duration-500 animate-fade-in-up delay-100">
              Deep <span className="inline-block relative">
                <span className="relative z-10">Work</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-brand-lime/30 dark:bg-brand-lime/20 -rotate-2 z-0"></span>
              </span> <br />
              Made Possible.
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mb-10 leading-relaxed font-light transition-colors duration-500 animate-fade-in-up delay-200">
              Our platform is designed with predictive AI in mind, making focus automatic and mitigating overload risk for your business.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-16 animate-fade-in-up delay-300">
              <button 
                  onClick={() => onNavigate(ViewState.DEMO)}
                  className="w-full sm:w-auto px-8 py-4 bg-brand-lime text-black rounded-lg font-bold text-lg transition-all duration-300 ease-fluid hover:bg-brand-limeHover hover:scale-105 active:scale-95 hover:shadow-[0_10px_40px_-10px_rgba(211,243,107,0.6)] flex items-center justify-center gap-2 shadow-lg shadow-brand-lime/20"
              >
                Book a Demo
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
              <button
                onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-6 py-4 rounded-lg text-gray-900 dark:text-white font-medium border border-gray-300 dark:border-white/20 hover:bg-white dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/40 transition-all duration-300 ease-fluid hover:scale-105 active:scale-95 hover:shadow-xl dark:hover:shadow-white/5"
              >
                Discover Khanect
              </button>
            </div>

            <div className="flex items-center gap-4 animate-fade-in-up delay-500">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-black flex items-center justify-center overflow-hidden relative z-0 transition-transform hover:z-10 hover:scale-110 duration-300">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*135}`} alt="User" />
                      </div>
                  ))}
               </div>
               <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">15+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 transition-colors">people joined us and <br/> choose simplicity</div>
               </div>
            </div>
          </div>

          {/* Right Visuals */}
          <div className="relative h-[600px] w-full hidden lg:block perspective-1000 animate-fade-in delay-200">
             
             {/* Main Central Visual - Organic Blob mimicking the glass object */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] opacity-80">
                 {/* Back Glow */}
                 <div className="absolute inset-0 bg-brand-lime/10 blur-[100px] rounded-full animate-pulse-slow"></div>
                 
                 {/* Organic Shapes simulating the glass orb */}
                 <div className="absolute inset-0 animate-morph" style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(211,243,107,0.1) 0%, rgba(0,0,0,0) 70%)',
                    boxShadow: 'inset 0 0 20px rgba(211,243,107,0.05), inset 10px 10px 40px rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(8px)',
                 }}></div>
                 
                 <div className="absolute inset-4 animate-morph" style={{
                    animationDelay: '-2s',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(211,243,107,0.05) 50%, rgba(0,0,0,0) 100%)',
                    boxShadow: 'inset -10px -10px 30px rgba(0,0,0,0.5)',
                    borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%',
                    transform: 'rotate(45deg)'
                 }}></div>
                 
                 <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-brand-lime/20 rounded-full blur-[40px] mix-blend-screen animate-pulse-slow"></div>
             </div>

             {/* Floating Card 1 - Top Right */}
             <div className="absolute top-[10%] right-[5%] animate-float hover:pause-animation z-20">
                <div className="bg-[#0A0A0B]/90 dark:bg-[#0A0A0B]/90 backdrop-blur-md p-5 rounded-2xl w-64 border border-white/5 shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-lg bg-[#1A1A1C] border border-white/5 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </div>
                    <div className="text-4xl font-semibold text-white mb-1">-75%</div>
                    <div className="text-xs text-gray-500 font-medium">Avg. Risk Mitigation Score</div>
                </div>
             </div>

             {/* Floating Card 2 - Bottom Left */}
             <div className="absolute bottom-[15%] left-[0%] animate-float-delayed hover:pause-animation z-20">
                <div className="bg-[#0A0A0B]/90 dark:bg-[#0A0A0B]/90 backdrop-blur-md p-5 rounded-2xl w-64 border border-white/5 shadow-2xl">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-lg bg-[#1A1A1C] border border-white/5 flex items-center justify-center text-white">
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </div>
                    <div className="text-4xl font-semibold text-white mb-1">+2.3h</div>
                    <div className="text-xs text-gray-500 font-medium">Weekly Focus Hours Recovered</div>
                </div>
             </div>

          </div>
        </div>
      </header>

      <section id="solutions" className="py-16 md:py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">
              Comprehensive Automation Solutions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg transition-colors">
              Tailored to your business needs and industry requirements
            </p>
          </div>

          <TabSwitch
            tabs={[
              { id: 'services', label: 'Core Services' },
              { id: 'industries', label: 'Industry Solutions' }
            ]}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as 'services' | 'industries')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 animate-fade-in-up">
            {activeTab === 'services'
              ? services.map(service => <ServiceCard key={service.id} {...service} />)
              : industries.map(industry => <ServiceCard key={industry.id} {...industry} />)
            }
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 md:py-24 px-6 relative z-10 bg-gray-50/50 dark:bg-brand-card/30 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg transition-colors">
              Choose the perfect plan to scale your automation journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPackages.map(pkg => (
              <PricingCard
                key={pkg.id}
                {...pkg}
                onCTAClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="py-16 md:py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">
              Our Proven Process
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg transition-colors">
              From discovery to deployment, we guide you every step of the way
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={step.number}
                {...step}
                isLast={index === processSteps.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 md:py-24 px-6 relative z-10 bg-gray-50/50 dark:bg-brand-card/30 transition-colors duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg transition-colors">
              Everything you need to know about our automation services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map(faq => (
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
      
      <section id="contact" className="py-16 md:py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto glass-card p-6 md:p-12 rounded-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white transition-colors">Ready to Automate?</h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">Tell us about your business, and we'll reach out with a custom plan.</p>
          </div>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-2 mb-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Thank you! We've received your submission and will be in touch soon.
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-2 mb-1"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              {errorMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleInputChangeWithValidation}
                  onBlur={handleFieldBlur}
                  className={getInputClassName('fullName')}
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting}
                />
                {touchedFields.has('fullName') && formErrors.fullName && (
                  <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {formErrors.fullName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChangeWithValidation}
                  onBlur={handleFieldBlur}
                  className={getInputClassName('email')}
                  placeholder="john@company.com"
                  required
                  disabled={isSubmitting}
                />
                {touchedFields.has('email') && formErrors.email && (
                  <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {formErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChangeWithValidation}
                  onBlur={handleFieldBlur}
                  className={getInputClassName('phone')}
                  placeholder="+1 (555) 000-0000"
                  required
                  disabled={isSubmitting}
                />
                {touchedFields.has('phone') && formErrors.phone && (
                  <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {formErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="businessName" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  value={formData.businessName}
                  onChange={handleInputChangeWithValidation}
                  onBlur={handleFieldBlur}
                  className={getInputClassName('businessName')}
                  placeholder="Acme Corp"
                  required
                  disabled={isSubmitting}
                />
                {touchedFields.has('businessName') && formErrors.businessName && (
                  <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {formErrors.businessName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Website URL <span className="text-gray-400 dark:text-gray-500">(Optional)</span></label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={handleInputChangeWithValidation}
                onBlur={handleFieldBlur}
                className={getInputClassName('website')}
                placeholder="https://www.example.com"
                disabled={isSubmitting}
              />
              {touchedFields.has('website') && formErrors.website && (
                <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {formErrors.website}
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-lime hover:bg-brand-limeHover text-black font-bold py-4 rounded-lg transition-all duration-300 ease-fluid hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(211,243,107,0.3)] mt-4 shadow-lg shadow-brand-lime/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Get Your Free Audit'
              )}
            </button>
          </form>
        </div>
      </section>

    </>
  );
};

export default LandingPage;