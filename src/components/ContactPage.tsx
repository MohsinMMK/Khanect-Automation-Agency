import { useState, useEffect, useCallback, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { validateEmail, validatePhone, validateUrl, validateName, validateBusinessName, validateMessage, MAX_LENGTHS } from '../utils/validation';
import { supabase } from '../lib/supabase';
import { processLead } from '../services/n8nService';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import CountryCodeSelect from './CountryCodeSelect';
import { toast } from 'sonner';
import { BackgroundGradient } from './ui/background-gradient';
import SEO from './SEO';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website: string;
  message: string;
  privacyConsent: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  website?: string;
  message?: string;
  privacyConsent?: string;
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
      className="w-full py-3.5 px-6 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-base hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sending...
        </span>
      ) : cooldown > 0 ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 36 36">
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
        <span className="flex items-center justify-center gap-2">
          Send Message
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </span>
      )}
    </button>
  );
}

function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    website: '',
    message: '',
    privacyConsent: false,
  });
  const [countryCode, setCountryCode] = useState('+1');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
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
        privacyConsent: submittedFormData.get('privacyConsent') === 'true',
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

      if (!data.privacyConsent) {
        errors.privacyConsent = 'You must agree to the privacy policy to continue';
      }

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
        setFormData({ fullName: '', email: '', phone: '', businessName: '', website: '', message: '', privacyConsent: false });
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

  const validateField = (fieldName: keyof FormData, value: string | boolean): string | undefined => {
    switch (fieldName) {
      case 'fullName':
        const nameResult = validateName(value as string, 'Full name');
        return nameResult.isValid ? undefined : nameResult.error;
      case 'email':
        const emailResult = validateEmail(value as string);
        return emailResult.isValid ? undefined : emailResult.error;
      case 'phone':
        const phoneResult = validatePhone(value as string);
        return phoneResult.isValid ? undefined : phoneResult.error;
      case 'businessName':
        const businessResult = validateBusinessName(value as string);
        return businessResult.isValid ? undefined : businessResult.error;
      case 'website':
        // Website is optional - only validate if not empty
        if (!(value as string).trim()) return undefined;
        const urlResult = validateUrl(value as string);
        return urlResult.isValid ? undefined : urlResult.error;
      case 'message':
        // Message is optional - validate max length
        const messageResult = validateMessage(value as string);
        return messageResult.isValid ? undefined : messageResult.error;
      case 'privacyConsent':
        return value ? undefined : 'You must agree to the privacy policy';
      default:
        return undefined;
    }
  };

  // Debounced validation to prevent rapid error message flickering
  const debouncedValidate = useDebouncedCallback(
    (fieldName: keyof FormData, value: string | boolean) => {
      const error = validateField(fieldName, value);
      setFormErrors(prev => ({ ...prev, [fieldName]: error }));
    },
    300
  );

  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    const fieldName = id as keyof FormData;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [fieldName]: fieldValue }));
    if (touchedFields.has(fieldName)) {
      // Use debounced validation for smoother UX
      debouncedValidate(fieldName, fieldValue);
    }
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    const fieldName = id as keyof FormData;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setTouchedFields(prev => new Set(prev).add(fieldName));
    const error = validateField(fieldName, fieldValue);
    setFormErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 relative">
      <SEO 
        title="Contact Us - Khanect AI"
        description="Ready to transform your business with AI automation? Get in touch with our team for a free consultation."
        canonical="https://khanect.com/contact"
      />
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-lime/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Ready to transform your business with AI automation? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info Cards - shows second on mobile, first on desktop */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Email Card */}
            <div className="group p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] hover:border-brand-lime/30 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-lime/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-lime/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email Us</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">We'll respond within 24 hours</p>
                  <a href="mailto:connect@khanect.com" className="text-brand-lime hover:text-brand-lime/80 font-medium transition-colors">
                    connect@khanect.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] hover:border-brand-lime/30 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-lime/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-lime/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Call Us</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Mon-Fri from 9am to 6pm</p>
                  <a href="tel:+916281944674" className="text-brand-lime hover:text-brand-lime/80 font-medium transition-colors">
                    +91 628 194 4674
                  </a>
                </div>
              </div>
            </div>

            {/* Office Card */}
            <div className="group p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] hover:border-brand-lime/30 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-lime/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-lime/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Visit Us</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Come say hello at our office</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Pillar No 258, Attapur<br />
                    Hyderabad, India
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white/[0.06] dark:to-white/[0.02]">
              <h3 className="font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/111252084/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>


          {/* Contact Form - shows first on mobile, second on desktop */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <BackgroundGradient className="rounded-3xl bg-white dark:bg-gray-900 p-8 md:p-10 h-full">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Send us a message
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form className="space-y-5" action={formAction}>
                {/* Hidden field for country code */}
                <input type="hidden" name="countryCode" value={countryCode} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChangeWithValidation}
                      onBlur={handleFieldBlur}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                      placeholder="John Doe"
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
                    <label htmlFor="businessName" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      Business name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChangeWithValidation}
                      onBlur={handleFieldBlur}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                      placeholder="Acme Inc."
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
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChangeWithValidation}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
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
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Phone number <span className="text-red-500">*</span>
                  </label>
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
                      className="flex-1 px-4 py-3 rounded-r-xl border border-l-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm"
                    placeholder="https://yourwebsite.com"
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
                  <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Message <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all text-sm resize-none"
                    placeholder="Tell us about your project or how we can help..."
                    rows={5}
                    maxLength={MAX_LENGTHS.message}
                    disabled={isPending}
                    aria-invalid={touchedFields.has('message') && !!formErrors.message}
                    aria-describedby={formErrors.message ? 'message-error' : undefined}
                  />
                  {touchedFields.has('message') && formErrors.message && (
                    <p id="message-error" className="text-xs text-red-500" role="alert">{formErrors.message}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacyConsent"
                      name="privacyConsent"
                      value="true"
                      checked={formData.privacyConsent}
                      onChange={handleInputChangeWithValidation}
                      onBlur={handleFieldBlur}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-lime focus:ring-brand-lime cursor-pointer"
                      aria-invalid={touchedFields.has('privacyConsent') && !!formErrors.privacyConsent}
                    />
                    <label htmlFor="privacyConsent" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      I agree to the <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-200">privacy policy</a> and consent to receiving communications from Khanect AI.
                    </label>
                  </div>
                  {touchedFields.has('privacyConsent') && formErrors.privacyConsent && (
                    <p id="privacyConsent-error" className="text-xs text-red-500 pl-7" role="alert">{formErrors.privacyConsent}</p>
                  )}
                </div>

                <SubmitButton cooldown={rateLimitCooldown} />
              </form>
            </BackgroundGradient>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
