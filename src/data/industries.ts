import { Industry } from '../types';
import HealthcareIcon from '../components/icons/HealthcareIcon';
import AutomobileIcon from '../components/icons/AutomobileIcon';
import EcommerceIcon from '../components/icons/EcommerceIcon';
import RealEstateIcon from '../components/icons/RealEstateIcon';
import CoachingIcon from '../components/icons/CoachingIcon';
import AgencyIcon from '../components/icons/AgencyIcon';

export const industries: Industry[] = [
  {
    id: 'healthcare',
    title: 'Healthcare Automation',
    description: 'HIPAA-compliant automation for healthcare providers including appointment scheduling, patient intake, and billing automation.',
    features: [
      'Patient appointment scheduling and reminders',
      'Automated patient intake forms',
      'Insurance verification workflows',
      'HIPAA-compliant chatbots for inquiries'
    ],
    icon: HealthcareIcon
  },
  {
    id: 'automobile',
    title: 'Automobile Industry',
    description: 'Streamline dealerships and auto service businesses with lead capture, test drive scheduling, and service automation.',
    features: [
      'Lead capture from listings and social media',
      'Test drive scheduling and confirmations',
      'Service appointment booking automation',
      'Vehicle maintenance reminder campaigns'
    ],
    icon: AutomobileIcon
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Automation',
    description: 'Scale your online store with order processing, inventory management, and customer support automation.',
    features: [
      'Order processing and fulfillment workflows',
      'Inventory sync across sales channels',
      'Abandoned cart recovery sequences',
      'Customer support chatbots for orders'
    ],
    icon: EcommerceIcon
  },
  {
    id: 'real-estate',
    title: 'Real Estate Automation',
    description: 'Manage leads, listings, and showings efficiently with automation designed for agents and brokerages.',
    features: [
      'Lead capture from Zillow and Realtor.com',
      'Automated lead response within minutes',
      'Property showing scheduling',
      'Drip campaigns for buyer and seller leads'
    ],
    icon: RealEstateIcon
  },
  {
    id: 'coaching',
    title: 'Coaching & Consulting',
    description: 'Focus on delivering value while automation handles client onboarding, session booking, and program delivery.',
    features: [
      'Discovery call scheduling and qualification',
      'Client onboarding workflows',
      'Session booking and reminder systems',
      'Invoice generation and payment collection'
    ],
    icon: CoachingIcon
  },
  {
    id: 'agency',
    title: 'Agency Automation',
    description: 'Scale your agency operations with client management, project automation, and reporting systems.',
    features: [
      'Client onboarding and asset collection',
      'Project management task automation',
      'Client reporting with branded templates',
      'Time tracking and billing automation'
    ],
    icon: AgencyIcon
  }
];
