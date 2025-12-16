import { PricingPackage } from '../types';

export const pricingPackages: PricingPackage[] = [
  {
    id: 'starter',
    title: 'Starter',
    price: 500,
    period: 'month',
    features: [
      'Up to 3 workflow automations',
      'Basic CRM integration',
      'Email automation setup',
      '30 days of support',
      'Documentation and training'
    ],
    targetAudience: 'Small businesses just getting started',
    isPopular: false
  },
  {
    id: 'growth',
    title: 'Growth',
    price: 1000,
    period: 'month',
    features: [
      'Up to 7 workflow automations',
      'Advanced CRM integration',
      'AI chatbot implementation',
      'Lead generation automation',
      '60 days of support',
      'Monthly optimization calls'
    ],
    targetAudience: 'Growing businesses ready to scale',
    isPopular: true
  },
  {
    id: 'scale',
    title: 'Scale',
    price: 2000,
    period: 'month',
    features: [
      'Up to 15 workflow automations',
      'Full CRM ecosystem integration',
      'Custom AI chatbot with knowledge base',
      'Complete lead generation system',
      'Customer portal development',
      '90 days of priority support',
      'Bi-weekly strategy calls'
    ],
    targetAudience: 'Established businesses needing comprehensive automation',
    isPopular: false
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    price: 'Custom',
    period: 'based on requirements',
    features: [
      'Unlimited workflow automations',
      'Custom software development',
      'Multi-department integration',
      'Dedicated automation engineer',
      '24/7 priority support',
      'Quarterly business reviews',
      'SLA guarantees'
    ],
    targetAudience: 'Large businesses requiring custom enterprise solutions',
    isPopular: false
  }
];
