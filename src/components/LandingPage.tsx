import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderAnimation } from './ui/shader-lines';
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
import { services } from '../data/services';
import { industries } from '../data/industries';
import { faqs } from '../data/faqs';
import { useStructuredData } from '../hooks/useStructuredData';
import {
  generateOrganizationSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateWebSiteSchema,
  combineSchemas
} from '../utils/structuredData';
import { processSteps } from '../data/process';

interface LandingPageProps {
  // Props are optional - component can work standalone
}

function LandingPage(_props: LandingPageProps = {}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'services' | 'industries'>('services');

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

  // Navigate to contact page
  const goToContact = useCallback(() => {
    navigate('/contact');
  }, [navigate]);

  const scrollToSolutions = useCallback(() => {
    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
              onClick={goToContact}
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

      {/* CTA Section */}
      <section className="py-24 lg:py-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
            Ready to Transform Your Business?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            Get in touch with our team to discuss how we can help automate your workflows and boost productivity.
          </p>
          <button
            onClick={goToContact}
            className="btn-primary text-lg px-10 py-4"
          >
            Get Started Today
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </button>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
