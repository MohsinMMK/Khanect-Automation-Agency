import type { FAQ, ProcessStep, PricingPackage, Service, Industry } from '../types';

const BASE_URL = 'https://khanect.com';
const ORG_NAME = 'Khanect AI';
const ORG_DESCRIPTION = 'Business Automation Agency that helps businesses streamline operations through AI-powered solutions and workflow automation.';

// Organization Schema - used on all pages
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    description: ORG_DESCRIPTION,
    foundingDate: '2024',
    areaServed: 'Worldwide',
    serviceType: 'Business Automation Services',
    knowsAbout: [
      'Business Automation',
      'AI Chatbots',
      'Workflow Automation',
      'CRM Integration',
      'Lead Generation',
      'N8N Automation'
    ],
    sameAs: []
  };
}

// FAQPage Schema - for homepage FAQ section
export function generateFAQSchema(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// HowTo Schema - for process section
export function generateHowToSchema(steps: ProcessStep[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Implement Business Automation with Khanect AI',
    description: 'Our proven 6-step process to transform your business operations with AI-powered automation.',
    totalTime: 'P8W',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '500-2000'
    },
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
      url: `${BASE_URL}/#process`
    }))
  };
}

// Service Schema - for service detail pages
export function generateServiceSchema(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.details?.fullDescription || service.description,
    provider: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: BASE_URL
    },
    areaServed: 'Worldwide',
    serviceType: 'Business Automation',
    url: `${BASE_URL}/services/${service.slug}`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.title} Features`,
      itemListElement: service.features.map((feature, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: feature
        },
        position: index + 1
      }))
    }
  };
}

// Industry Service Schema - for industry detail pages
export function generateIndustrySchema(industry: Industry) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: industry.title,
    description: industry.details?.fullDescription || industry.description,
    provider: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: BASE_URL
    },
    areaServed: 'Worldwide',
    serviceType: `${industry.title} Services`,
    url: `${BASE_URL}/industries/${industry.slug}`,
    audience: {
      '@type': 'Audience',
      audienceType: industry.title.replace(' Automation', '').replace(' Industry', '')
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${industry.title} Features`,
      itemListElement: industry.features.map((feature, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: feature
        },
        position: index + 1
      }))
    }
  };
}

// Product/Offer Schema - for pricing page
export function generatePricingSchema(packages: PricingPackage[]) {
  return packages
    .filter((pkg) => typeof pkg.price === 'number')
    .map((pkg) => ({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${pkg.title} Plan - ${ORG_NAME}`,
      description: pkg.targetAudience,
      brand: {
        '@type': 'Organization',
        name: ORG_NAME
      },
      offers: {
        '@type': 'Offer',
        price: pkg.price,
        priceCurrency: 'USD',
        priceValidUntil: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0],
        availability: 'https://schema.org/InStock',
        url: `${BASE_URL}/pricing`,
        seller: {
          '@type': 'Organization',
          name: ORG_NAME
        }
      },
      additionalProperty: pkg.features.map((feature) => ({
        '@type': 'PropertyValue',
        name: 'Feature',
        value: feature
      }))
    }));
}

// BreadcrumbList Schema - for navigation
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

// WebSite Schema - for homepage
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url: BASE_URL,
    description: ORG_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

// Combine multiple schemas into a single graph
export function combineSchemas(...schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map((schema) => {
      const { '@context': _, ...rest } = schema as { '@context'?: string };
      return rest;
    })
  };
}
