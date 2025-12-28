import React, { useState } from 'react';
import { ViewState } from '../types';
import { validateEmail, validatePhone, validateUrl, validateName } from '../utils/validation';
import { supabase } from '../lib/supabase';
import { processLead } from '../services/n8nService';
import TabSwitch from './TabSwitch';
import ServiceCard from './ServiceCard';
import ProcessStep from './ProcessStep';
import FAQItem from './FAQItem';
import StaggerContainer from './StaggerContainer';
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
    const errors: FormErrors = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      businessName: validateField('businessName', formData.businessName),
      website: validateField('website', formData.website),
    };
    setTouchedFields(new Set(['fullName', 'email', 'phone', 'businessName', 'website']));
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
        if (!import.meta.env.DEV) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        }
      }

      // Process lead via N8N webhook (non-blocking)
      if (supabaseSuccess) {
        processLead({
          submissionId: supabaseId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName,
          website: formData.website,
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
      setFormData({ fullName: '', email: '', phone: '', businessName: '', website: '' });
      setFormErrors({});
      setTouchedFields(new Set());
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
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] opacity-80">
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

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
            {activeTab === 'services'
              ? services.map(service => <ServiceCard key={service.id} {...service} />)
              : industries.map(industry => <ServiceCard key={industry.id} {...industry} />)
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
        <div className="max-w-3xl mx-auto glass-card p-8 md:p-12 rounded-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight">Ready to Automate?</h2>
            <p className="text-gray-500 dark:text-gray-400">Tell us about your business, and we'll reach out with a custom plan.</p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-2 mb-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Thank you! We've received your submission and will be in touch soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-2 mb-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              {errorMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-600 dark:text-gray-300 block">Full Name</label>
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
                  <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {formErrors.fullName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-600 dark:text-gray-300 block">Email Address</label>
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
                  <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {formErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-600 dark:text-gray-300 block">Phone</label>
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
                  <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {formErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="businessName" className="text-sm font-medium text-gray-600 dark:text-gray-300 block">Business Name</label>
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
                  <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {formErrors.businessName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium text-gray-600 dark:text-gray-300 block">
                Website URL <span className="text-gray-400">(Optional)</span>
              </label>
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
                <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {formErrors.website}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-lg py-4 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
