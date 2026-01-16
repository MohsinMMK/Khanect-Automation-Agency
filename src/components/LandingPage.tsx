import { useState, useEffect, useCallback, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ShaderAnimation } from './ui/shader-lines';
import { validateEmail, validatePhone, validateUrl, validateName, validateBusinessName, validateMessage, MAX_LENGTHS } from '../utils/validation';
import { supabase } from '../lib/supabase';
import { processLead } from '../services/n8nService';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import TabSwitch from './TabSwitch';
import ServiceCard from './ServiceCard';
import ProvenProcess from './ProvenProcess';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StaggerContainer from './StaggerContainer';
import CountryCodeSelect from './CountryCodeSelect';
import { services } from '../data/services';
import { industries } from '../data/industries';
import { processSteps } from '../data/process';
import { faqs } from '../data/faqs';
import { useStructuredData } from '../hooks/useStructuredData';
import {
  generateOrganizationSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateWebSiteSchema,
  combineSchemas
} from '../utils/structuredData';
import { toast } from 'sonner';

interface LandingPageProps {
  // Props are optional - component can work standalone
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
  submit?: string;
}

interface FormState {
  errors: FormErrors;
  success: boolean;
  message?: string;
}

// Rate limiting: 60 seconds between submissions
const RATE_LIMIT_SECONDS = 60;
const RATE_LIMIT_KEY = 'khanect_last_submission';

// Submit button component using useFormStatus for pending state
function SubmitButton({ cooldown }: { cooldown: number }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || cooldown > 0;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="w-full py-3 px-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sending...
        </span>
      ) : cooldown > 0 ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.3"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${(cooldown / RATE_LIMIT_SECONDS) * 100} 100`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
              className="transition-all duration-1000"
            />
          </svg>
          Wait {cooldown}s
        </span>
      ) : (
        'Send message'
      )}
    </button>
  );
}

function LandingPage(_props: LandingPageProps = {}) {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    website: '',
    message: '',
  });
  const [countryCode, setCountryCode] = useState('+1');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'services' | 'industries'>('services');
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

  // Form action using React 19 useActionState
  const [formState, formAction, isPending] = useActionState<FormState, globalThis.FormData>(
    async (prevState, submittedFormData) => {
      // Check rate limiting
      const lastSubmission = sessionStorage.getItem(RATE_LIMIT_KEY);
      if (lastSubmission) {
        const elapsed = Math.floor((Date.now() - parseInt(lastSubmission, 10)) / 1000);
        if (elapsed < RATE_LIMIT_SECONDS) {
          toast.error(`Please wait ${RATE_LIMIT_SECONDS - elapsed} seconds before submitting again.`);
          return { errors: {}, success: false };
        }
      }

      // Extract form data
      const data = {
        fullName: submittedFormData.get('fullName') as string,
        email: submittedFormData.get('email') as string,
        phone: submittedFormData.get('phone') as string,
        businessName: submittedFormData.get('businessName') as string,
        website: submittedFormData.get('website') as string || '',
        message: submittedFormData.get('message') as string || '',
        countryCode: submittedFormData.get('countryCode') as string,
      };

      // Validate all fields
      const errors: FormErrors = {};
      const nameResult = validateName(data.fullName, 'Full name');
      if (!nameResult.isValid) errors.fullName = nameResult.error;

      const emailResult = validateEmail(data.email);
      if (!emailResult.isValid) errors.email = emailResult.error;

      const phoneResult = validatePhone(data.phone);
      if (!phoneResult.isValid) errors.phone = phoneResult.error;

      const businessResult = validateBusinessName(data.businessName);
      if (!businessResult.isValid) errors.businessName = businessResult.error;

      if (data.website.trim()) {
        const urlResult = validateUrl(data.website);
        if (!urlResult.isValid) errors.website = urlResult.error;
      }

      const messageResult = validateMessage(data.message);
      if (!messageResult.isValid) errors.message = messageResult.error;

      if (Object.keys(errors).length > 0) {
        setTouchedFields(new Set(['fullName', 'email', 'phone', 'businessName', 'website', 'message']));
        setFormErrors(errors);
        toast.error('Please fix the errors above before submitting.');
        return { errors, success: false };
      }

      try {
        const submissionId = crypto.randomUUID();
        let supabaseSuccess = false;

        if (supabase) {
          const fullPhoneNumber = `${data.countryCode} ${data.phone}`;
          const { error: supabaseError } = await supabase
            .from('contact_submissions')
            .insert([{
              id: submissionId,
              full_name: data.fullName,
              email: data.email,
              phone: fullPhoneNumber,
              business_name: data.businessName,
              website: data.website || null,
              message: data.message || null,
            }]);

          if (supabaseError) {
            console.error('Supabase error:', supabaseError);
            if (supabaseError.message.includes('policy')) {
              throw new Error('Database configuration error. Please contact support.');
            }
            throw new Error('Failed to save your submission. Please try again.');
          }
          supabaseSuccess = true;
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
            fullName: data.fullName,
            email: data.email,
            phone: `${data.countryCode} ${data.phone}`,
            businessName: data.businessName,
            website: data.website,
            message: data.message,
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

        // Reset form on success
        setFormData({ fullName: '', email: '', phone: '', businessName: '', website: '', message: '' });
        setFormErrors({});
        setTouchedFields(new Set());
        sessionStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
        setRateLimitCooldown(RATE_LIMIT_SECONDS);

        toast.success("Thank you! We've received your submission and will be in touch soon.");
        return { errors: {}, success: true, message: 'Submission successful!' };
      } catch (error) {
        console.error('Form submission error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
        toast.error(errorMessage);
        return { errors: { submit: errorMessage }, success: false };
      }
    },
    { errors: {}, success: false }
  );

  // Structured data for SEO rich snippets
  useStructuredData(
    combineSchemas(
      generateOrganizationSchema(),
      generateWebSiteSchema(),
      generateFAQSchema(faqs),
      generateHowToSchema(processSteps)
    ),
    'landing-page'
  );

  // Memoized scroll handlers
  const scrollToContact = useCallback(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToSolutions = useCallback(() => {
    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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

  // Debounced validation to prevent rapid error message flickering
  const debouncedValidate = useDebouncedCallback(
    (fieldName: keyof FormData, value: string) => {
      const error = validateField(fieldName, value);
      setFormErrors(prev => ({ ...prev, [fieldName]: error }));
    },
    300
  );

  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id as keyof FormData;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (touchedFields.has(fieldName)) {
      // Use debounced validation for smoother UX
      debouncedValidate(fieldName, value);
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

  return (
    <>
      {/* Hero Section */}
      <header className="relative pt-32 lg:pt-40 pb-20 lg:pb-32 px-6 min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60 pointer-events-none">
          <ShaderAnimation />
        </div>

        <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center text-center relative z-10">

          {/* Centered Content */}
          <h1 
            className="font-logo font-bold tracking-tight mb-12 text-gray-900 dark:text-white leading-tight whitespace-nowrap" 
            style={{ fontSize: 'clamp(24px, 5vw, 60px)' }}
          >
            Voices That Connect.<br />
            Systems That Sync.<br />
            AI That Delivers.
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={scrollToContact}
              className="btn-primary text-lg px-8 py-4"
            >
              Book a Demo
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </button>
            <button
              onClick={scrollToSolutions}
              className="btn-secondary text-lg px-8 py-4 hover:!text-[#14B8A6] hover:!border-[#14B8A6] hover:!bg-[#14B8A6]/10 dark:hover:!text-[#14B8A6] dark:hover:!border-[#14B8A6] dark:hover:!bg-[#14B8A6]/10"
            >
              Discover Khanect
            </button>
          </div>

          </div>

        {/* Social Proof - Bottom Left */}
        <div className="absolute bottom-8 left-8 z-20 hidden md:flex items-center gap-4">
            <div className="flex -space-x-3">
            {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-950 flex items-center justify-center overflow-hidden relative z-0 transition-transform hover:z-10 hover:scale-110 duration-300">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*135}`} alt="User" />
                </div>
            ))}
            </div>
            <div className="text-left">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">15+</div>
            <div className="text-xs text-gray-500">people joined us and <br/> choose simplicity</div>
            </div>
        </div>


      </header>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 lg:py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
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
      <ProvenProcess />

      {/* FAQ Section */}
      <section id="faq" className="py-24 lg:py-32 px-6 relative z-10 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Everything you need to know about our automation services
            </p>
          </div>

          <Accordion className="space-y-4" type="single" collapsible>
            {faqs.map(faq => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 lg:py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl">
            {/* Left Side - Form */}
            <div className="bg-white dark:bg-gray-900 p-8 md:p-12">
              {/* Logo */}
              <div className="mb-2">
                <img
                  src="/logo-full.png"
                  alt="Khanect"
                  className="h-32 -mt-10 -ml-10 object-contain"
                />
              </div>

              {/* Heading */}
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight">
                We'd love to help
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                We're a full service agency with experts ready to help. We'll get in touch within 24 hours.
              </p>

              {/* Form */}
              <form className="space-y-5" action={formAction}>
                {/* Hidden field for country code */}
                <input type="hidden" name="countryCode" value={countryCode} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Full name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChangeWithValidation}
                      onBlur={handleFieldBlur}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                      placeholder="Full name"
                      required
                      maxLength={MAX_LENGTHS.name}
                      disabled={isPending}
                      aria-invalid={touchedFields.has('fullName') && !!formErrors.fullName}
                      aria-describedby={formErrors.fullName ? 'fullName-error' : undefined}
                    />
                    {touchedFields.has('fullName') && formErrors.fullName && (
                      <p id="fullName-error" className="text-xs text-red-500" role="alert">{formErrors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="businessName" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Business name</label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChangeWithValidation}
                      onBlur={handleFieldBlur}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                      placeholder="Business name"
                      required
                      maxLength={MAX_LENGTHS.businessName}
                      disabled={isPending}
                      aria-invalid={touchedFields.has('businessName') && !!formErrors.businessName}
                      aria-describedby={formErrors.businessName ? 'businessName-error' : undefined}
                    />
                    {touchedFields.has('businessName') && formErrors.businessName && (
                      <p id="businessName-error" className="text-xs text-red-500" role="alert">{formErrors.businessName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChangeWithValidation}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                    placeholder="you@company.com"
                    required
                    maxLength={MAX_LENGTHS.email}
                    disabled={isPending}
                    aria-invalid={touchedFields.has('email') && !!formErrors.email}
                    aria-describedby={formErrors.email ? 'email-error' : undefined}
                  />
                  {touchedFields.has('email') && formErrors.email && (
                    <p id="email-error" className="text-xs text-red-500" role="alert">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Phone number</label>
                  <div className="flex">
                    <CountryCodeSelect
                      value={countryCode}
                      onChange={setCountryCode}
                      disabled={isPending}
                    />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChangeWithValidation}
                      onBlur={handleFieldBlur}
                      className="flex-1 px-4 py-2.5 rounded-r-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                      placeholder="(555) 000-0000"
                      required
                      maxLength={MAX_LENGTHS.phone}
                      disabled={isPending}
                      aria-invalid={touchedFields.has('phone') && !!formErrors.phone}
                      aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                    />
                  </div>
                  {touchedFields.has('phone') && formErrors.phone && (
                    <p id="phone-error" className="text-xs text-red-500" role="alert">{formErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Website <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChangeWithValidation}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                    placeholder="yourwebsite.com"
                    maxLength={MAX_LENGTHS.website}
                    disabled={isPending}
                    aria-invalid={touchedFields.has('website') && !!formErrors.website}
                    aria-describedby={formErrors.website ? 'website-error' : undefined}
                  />
                  {touchedFields.has('website') && formErrors.website && (
                    <p id="website-error" className="text-xs text-red-500" role="alert">{formErrors.website}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Message</label>
                  <textarea
                    id="message"
                    name="message"
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
                    disabled={isPending}
                    aria-invalid={touchedFields.has('message') && !!formErrors.message}
                    aria-describedby={formErrors.message ? 'message-error' : undefined}
                  />
                  {touchedFields.has('message') && formErrors.message && (
                    <p id="message-error" className="text-xs text-red-500" role="alert">{formErrors.message}</p>
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

                <SubmitButton cooldown={rateLimitCooldown} />
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
