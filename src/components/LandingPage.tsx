import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { validateEmail, validatePhone, validateUrl, validateName, validateBusinessName, validateMessage, MAX_LENGTHS } from '../utils/validation';
import { supabase } from '../lib/supabase';
import { processLead } from '../services/n8nService';
import TabSwitch from './TabSwitch';
import ServiceCard from './ServiceCard';
import ProcessStep from './ProcessStep';
import FAQItem from './FAQItem';
import StaggerContainer from './StaggerContainer';
import CountryCodeSelect from './CountryCodeSelect';
import { DottedSurface } from './ui/dotted-surface';
import { services } from '../data/services';
import { industries } from '../data/industries';
import { processSteps } from '../data/process';
import { faqs } from '../data/faqs';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  website?: string;
  message?: string;
}

// Rate limiting: 60 seconds between submissions
const RATE_LIMIT_SECONDS = 60;
const RATE_LIMIT_KEY = 'khanect_last_submission';

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    website: '',
    message: '',
  });
  const [countryCode, setCountryCode] = useState('+1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'services' | 'industries'>('services');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

  // Check and update rate limit cooldown
  useEffect(() => {
    const checkCooldown = () => {
      const lastSubmission = sessionStorage.getItem(RATE_LIMIT_KEY);
      if (lastSubmission) {
        const elapsed = Math.floor((Date.now() - parseInt(lastSubmission, 10)) / 1000);
        const remaining = Math.max(0, RATE_LIMIT_SECONDS - elapsed);
        setRateLimitCooldown(remaining);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

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
        const businessResult = validateBusinessName(value);
        return businessResult.isValid ? undefined : businessResult.error;
      case 'website':
        // Website is optional - only validate if not empty
        if (!value.trim()) return undefined;
        const urlResult = validateUrl(value);
        return urlResult.isValid ? undefined : urlResult.error;
      case 'message':
        // Message is optional - validate max length
        const messageResult = validateMessage(value);
        return messageResult.isValid ? undefined : messageResult.error;
      default:
        return undefined;
    }
  };

  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id as keyof FormData;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (touchedFields.has(fieldName)) {
      const error = validateField(fieldName, value);
      setFormErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id as keyof FormData;
    setTouchedFields(prev => new Set(prev).add(fieldName));
    const error = validateField(fieldName, value);
    setFormErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    const baseClasses = "w-full bg-gray-50 dark:bg-white/[0.03] border rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-180 focus:ring-2";
    const hasError = touchedFields.has(fieldName) && formErrors[fieldName];
    if (hasError) {
      return `${baseClasses} border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/30`;
    }
    return `${baseClasses} border-gray-200 dark:border-white/[0.08] focus:border-brand-lime focus:ring-brand-lime/30`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiting
    if (rateLimitCooldown > 0) {
      setSubmitStatus('error');
      setErrorMessage(`Please wait ${rateLimitCooldown} seconds before submitting again.`);
      return;
    }

    const errors: FormErrors = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      businessName: validateField('businessName', formData.businessName),
      website: validateField('website', formData.website),
      message: validateField('message', formData.message),
    };
    setTouchedFields(new Set(['fullName', 'email', 'phone', 'businessName', 'website', 'message']));
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
      // Generate a client-side UUID for tracking
      const submissionId = crypto.randomUUID();
      let supabaseSuccess = false;

      if (supabase) {
        try {
          const fullPhoneNumber = `${countryCode} ${formData.phone}`;
          const { error: supabaseError } = await supabase
            .from('contact_submissions')
            .insert([{
              id: submissionId,
              full_name: formData.fullName,
              email: formData.email,
              phone: fullPhoneNumber,
              business_name: formData.businessName,
              website: formData.website || null,
              message: formData.message || null,
            }]);

          if (supabaseError) {
            console.error('Supabase error:', supabaseError);
            if (supabaseError.message.includes('policy')) {
              throw new Error('Database configuration error. Please contact support.');
            }
            throw new Error('Failed to save your submission. Please try again.');
          }
          supabaseSuccess = true;
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          throw dbErr;
        }
      } else {
        console.warn('Supabase not configured. Skipping database save.');
        if (!import.meta.env.DEV) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        }
      }

      // Process lead via N8N webhook (non-blocking)
      if (supabaseSuccess) {
        processLead({
          submissionId,
          fullName: formData.fullName,
          email: formData.email,
          phone: `${countryCode} ${formData.phone}`,
          businessName: formData.businessName,
          website: formData.website,
          message: formData.message,
        }).then((result) => {
          if (result.success) {
            console.log('Lead processed via N8N');
          } else {
            console.warn('Lead processing error (non-blocking):', result.error);
          }
        });
      }

      if (!supabaseSuccess) {
        throw new Error('Unable to process your submission. Please try again.');
      }

      setSubmitStatus('success');
      setFormData({ fullName: '', email: '', phone: '', businessName: '', website: '', message: '' });
      setFormErrors({});
      setTouchedFields(new Set());
      // Store submission timestamp for rate limiting
      sessionStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      setRateLimitCooldown(RATE_LIMIT_SECONDS);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <header className="relative pt-32 lg:pt-40 pb-20 lg:pb-32 px-6 min-h-screen flex items-center overflow-hidden">
        {/* Animated Background - Hero Only */}
        <DottedSurface />
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">

          {/* Left Content */}
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.05] text-gray-900 dark:text-white">
              Deep <span className="inline-block relative">
                <span className="relative z-10">Work</span>
                <span className="absolute bottom-2 left-0 w-full h-2 bg-brand-lime/20 -rotate-1 z-0"></span>
              </span>
              <br />Made Possible.
            </h1>

            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mb-12 leading-relaxed">
              Our platform is designed with predictive AI in mind, making focus automatic and mitigating overload risk for your business.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16">
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary text-lg px-8 py-4"
              >
                Book a Demo
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
              <button
                onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-lg px-8 py-4"
              >
                Discover Khanect
              </button>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-950 flex items-center justify-center overflow-hidden relative z-0 transition-transform hover:z-10 hover:scale-110 duration-300">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*135}`} alt="User" />
                      </div>
                  ))}
               </div>
               <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">15+</div>
                  <div className="text-xs text-gray-500">people joined us and <br/> choose simplicity</div>
               </div>
            </div>
          </div>

          {/* Right Visuals */}
          <div className="relative h-[600px] w-full hidden lg:block perspective-1000 animate-fade-in">

             {/* Main Central Visual */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] opacity-80 z-10">
                 {/* Backdrop to block dotted animation */}
                 <div className="absolute inset-0 rounded-full bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl"></div>
                 <div className="absolute inset-0 bg-brand-lime/10 blur-[100px] rounded-full animate-pulse-slow"></div>
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

             {/* Floating Card 1 */}
             <div className="absolute top-[10%] right-[5%] animate-float z-20">
                <div className="glass-card p-5 rounded-2xl w-64">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </div>
                    <div className="text-4xl font-semibold text-gray-900 dark:text-white mb-1">-75%</div>
                    <div className="text-xs text-gray-500 font-medium">Avg. Risk Mitigation Score</div>
                </div>
             </div>

             {/* Floating Card 2 */}
             <div className="absolute bottom-[15%] left-[0%] animate-float-delayed z-20">
                <div className="glass-card p-5 rounded-2xl w-64">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-white">
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </div>
                    <div className="text-4xl font-semibold text-gray-900 dark:text-white mb-1">+2.3h</div>
                    <div className="text-xs text-gray-500 font-medium">Weekly Focus Hours Recovered</div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 lg:py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
              Comprehensive Automation Solutions
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
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

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-12">
            {activeTab === 'services'
              ? services.map(service => <ServiceCard key={service.id} {...service} category="services" />)
              : industries.map(industry => <ServiceCard key={industry.id} {...industry} category="industries" />)
            }
          </StaggerContainer>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 lg:py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
              Our Proven Process
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              From discovery to deployment, we guide you every step of the way
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={step.number}
                {...step}
                isLast={index === processSteps.length - 1}
              />
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 lg:py-32 px-6 relative z-10 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Everything you need to know about our automation services
            </p>
          </div>

          <div className="space-y-0">
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

      {/* Contact Section */}
      <section id="contact" className="py-24 lg:py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl">
            {/* Left Side - Form */}
            <div className="bg-white dark:bg-gray-900 p-8 md:p-12">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white dark:text-gray-900">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-lg">
                  <span className="text-gray-900 dark:text-white">KHAN</span>
                  <span className="text-brand-lime">ECT</span>
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight">
                We'd love to help
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                We're a full service agency with experts ready to help. We'll get in touch within 24 hours.
              </p>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-2 mb-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Thank you! We've received your submission and will be in touch soon.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-2 mb-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Full name</label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChangeWithValidation}
                      onBlur={handleFieldBlur}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                      placeholder="Full name"
                      required
                      maxLength={MAX_LENGTHS.name}
                      disabled={isSubmitting}
                    />
                    {touchedFields.has('fullName') && formErrors.fullName && (
                      <p className="text-xs text-red-500">{formErrors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="businessName" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Business name</label>
                    <input
                      type="text"
                      id="businessName"
                      value={formData.businessName}
                      onChange={handleInputChangeWithValidation}
                      onBlur={handleFieldBlur}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                      placeholder="Business name"
                      required
                      maxLength={MAX_LENGTHS.businessName}
                      disabled={isSubmitting}
                    />
                    {touchedFields.has('businessName') && formErrors.businessName && (
                      <p className="text-xs text-red-500">{formErrors.businessName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChangeWithValidation}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                    placeholder="you@company.com"
                    required
                    maxLength={MAX_LENGTHS.email}
                    disabled={isSubmitting}
                  />
                  {touchedFields.has('email') && formErrors.email && (
                    <p className="text-xs text-red-500">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Phone number</label>
                  <div className="flex">
                    <CountryCodeSelect
                      value={countryCode}
                      onChange={setCountryCode}
                      disabled={isSubmitting}
                    />
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChangeWithValidation}
                      onBlur={handleFieldBlur}
                      className="flex-1 px-4 py-2.5 rounded-r-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                      placeholder="(555) 000-0000"
                      required
                      maxLength={MAX_LENGTHS.phone}
                      disabled={isSubmitting}
                    />
                  </div>
                  {touchedFields.has('phone') && formErrors.phone && (
                    <p className="text-xs text-red-500">{formErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Website <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="website"
                    value={formData.website}
                    onChange={handleInputChangeWithValidation}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                    placeholder="yourwebsite.com"
                    maxLength={MAX_LENGTHS.website}
                    disabled={isSubmitting}
                  />
                  {touchedFields.has('website') && formErrors.website && (
                    <p className="text-xs text-red-500">{formErrors.website}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Message</label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, message: e.target.value }));
                      if (touchedFields.has('message')) {
                        const error = validateField('message', e.target.value);
                        setFormErrors(prev => ({ ...prev, message: error }));
                      }
                    }}
                    onBlur={() => {
                      setTouchedFields(prev => new Set(prev).add('message'));
                      const error = validateField('message', formData.message);
                      setFormErrors(prev => ({ ...prev, message: error }));
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm resize-none"
                    placeholder="Leave us a message..."
                    rows={4}
                    maxLength={MAX_LENGTHS.message}
                    disabled={isSubmitting}
                  />
                  {touchedFields.has('message') && formErrors.message && (
                    <p className="text-xs text-red-500">{formErrors.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-lime focus:ring-brand-lime"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-500 dark:text-gray-400">
                    You agree to our friendly <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-200">privacy policy</a>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || rateLimitCooldown > 0}
                  className="w-full py-3 px-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : rateLimitCooldown > 0 ? (
                    `Please wait ${rateLimitCooldown}s`
                  ) : (
                    'Send message'
                  )}
                </button>
              </form>
            </div>

            {/* Right Side - Testimonial */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-8 md:p-12 flex flex-col justify-end min-h-[500px] lg:min-h-0">
              {/* Abstract decorative elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-2xl transform rotate-12"></div>
                <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-to-br from-cyan-400/30 to-purple-500/30 rounded-3xl transform -rotate-6"></div>
                <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-pink-500/20 rounded-xl transform rotate-45"></div>
                <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/5 rounded-lg"></div>
                <div className="absolute bottom-1/4 left-10 w-20 h-20 bg-gradient-to-tr from-teal-400/20 to-blue-500/20 rounded-2xl transform -rotate-12"></div>
              </div>

              {/* Testimonial content */}
              <div className="relative z-10 mt-auto">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-white text-lg md:text-xl leading-relaxed mb-6">
                  "Khanect AI transformed our workflow completely. We've automated 80% of our repetitive tasks and saved over 40 hours per week. The team is incredibly responsive and professional."
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">— Sarah Mitchell</p>
                    <p className="text-white/70 text-sm">CEO, TechFlow Solutions</p>
                  </div>

                  {/* Navigation arrows */}
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
