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
    slug: 'healthcare-automation',
    title: 'Healthcare Automation',
    description: 'HIPAA-compliant automation for healthcare providers including appointment scheduling, patient intake, and billing automation.',
    features: [
      'Patient appointment scheduling and reminders',
      'Automated patient intake forms',
      'Insurance verification workflows',
      'HIPAA-compliant chatbots for inquiries'
    ],
    icon: HealthcareIcon,
    details: {
      fullDescription: 'In healthcare, efficiency literally saves lives. Our HIPAA-compliant automation solutions streamline administrative burdens, allowing providers to focus on patient care. We automate the entire patient journey—from the first appointment request to post-visit follow-ups—ensuring data accuracy and compliance at every step.',
      benefits: [
        'Reduce no-show rates with automated reminders',
        'Eliminate manual data entry errors in patient records',
        'Verify insurance coverage instantly and automatically',
        'Provide 24/7 patient support without extra staff'
      ],
      process: [
        'Compliance Audit: We ensure all workflows meet HIPAA standards.',
        'Workflow Mapping: We design the patient journey automation.',
        'Secure Integration: We connect your EHR/EMR systems securely.',
        'Staff Training: We train your team on the new automated tools.'
      ]
    }
  },
  {
    id: 'automobile',
    slug: 'automobile-industry-automation',
    title: 'Automobile Industry',
    description: 'Streamline dealerships and auto service businesses with lead capture, test drive scheduling, and service automation.',
    features: [
      'Lead capture from listings and social media',
      'Test drive scheduling and confirmations',
      'Service appointment booking automation',
      'Vehicle maintenance reminder campaigns'
    ],
    icon: AutomobileIcon,
    details: {
      fullDescription: 'Modern car buying starts online. We help dealerships and auto service centers capture every digital opportunity. Our automation suites handle incoming leads from third-party sites, schedule test drives instantly, and automate service reminders, ensuring your showroom and service bays are always full.',
      benefits: [
        'Respond to leads in seconds, not hours',
        'Automate service reminders to boost recurring revenue',
        'Sync inventory data across all marketing channels',
        'Personalize follow-ups based on vehicle interest'
      ],
      process: [
        'Lead Source Audit: We identify where your buyers are coming from.',
        'CRM Connection: We integrate your DMS/CRM for real-time sync.',
        'Automation Build: We set up test drive and service workflows.',
        'Performance Tracking: We monitor engagement and appointment rates.'
      ]
    }
  },
  {
    id: 'ecommerce',
    slug: 'ecommerce-automation',
    title: 'E-Commerce Automation',
    description: 'Scale your online store with order processing, inventory management, and customer support automation.',
    features: [
      'Order processing and fulfillment workflows',
      'Inventory sync across sales channels',
      'Abandoned cart recovery sequences',
      'Customer support chatbots for orders'
    ],
    icon: EcommerceIcon,
    details: {
      fullDescription: 'Scaling an e-commerce brand requires operational excellence. Our automation solutions handle the heavy lifting of backend operations—syncing inventory, processing orders, and managing returns—so you can focus on brand and product. We verify every order, update stock levels in real-time, and ensure customers are kept in the loop.',
      benefits: [
        'Prevent overselling with real-time inventory sync',
        'Recover lost revenue with smart abandoned cart flows',
        'Automate shipping labels and tracking updates',
        'Handle peak season volume without extra hiring'
      ],
      process: [
        'Store Analysis: We review your platform (Shopify, WooCommerce, etc.).',
        'Workflow Design: We map out order, inventory, and support flows.',
        'Integration: We connect your store, 3PL, and marketing tools.',
        'Launch & Scale: We deploy the system and optimize for high volume.'
      ]
    }
  },
  {
    id: 'real-estate',
    slug: 'real-estate-automation',
    title: 'Real Estate Automation',
    description: 'Manage leads, listings, and showings efficiently with automation designed for agents and brokerages.',
    features: [
      'Lead capture from Zillow and Realtor.com',
      'Automated lead response within minutes',
      'Property showing scheduling',
      'Drip campaigns for buyer and seller leads'
    ],
    icon: RealEstateIcon,
    details: {
      fullDescription: 'Speed to lead is everything in real estate. Our automation ensures you are the first to respond to every inquiry. We consolidate leads from Zillow, Realtor.com, and your website into a single pipeline, automatically qualifying them and scheduling showings, so you spend your time closing deals, not chasing prospects.',
      benefits: [
        'Respond to new leads within 60 seconds 24/7',
        'Automate open house follow-ups and feedback',
        'Nurture cold leads until they are ready to buy/sell',
        'Sync MLS data to your marketing materials automatically'
      ],
      process: [
        'Lead Flow Analysis: We map all your lead sources.',
        'CRM Setup: We configure your CRM for automated intake.',
        'Drip Campaign Setup: We write and load nurturing sequences.',
        'Go Live: We launch the system and monitor response rates.'
      ]
    }
  },
  {
    id: 'coaching',
    slug: 'coaching-consulting-automation',
    title: 'Coaching & Consulting',
    description: 'Focus on delivering value while automation handles client onboarding, session booking, and program delivery.',
    features: [
      'Discovery call scheduling and qualification',
      'Client onboarding workflows',
      'Session booking and reminder systems',
      'Invoice generation and payment collection'
    ],
    icon: CoachingIcon,
    details: {
      fullDescription: 'Your expertise is your product, not your admin work. We automate the business side of coaching and consulting—from booking discovery calls to onboarding new clients and processing payments. This allows you to deliver a premium, frictionless client experience without being bogged down in paperwork.',
      benefits: [
        'Eliminate back-and-forth scheduling emails',
        'Automate contracts, invoices, and payment collection',
        'Deliver digital course content automatically',
        'Collect testimonials and feedback on autopilot'
      ],
      process: [
        'Offer Audit: We review your packages and pricing.',
        'Funnel Build: We set up the booking and payment flow.',
        'Onboarding Design: We create the welcome sequence for new clients.',
        'Automation Launch: We test the end-to-end client experience.'
      ]
    }
  },
  {
    id: 'agency',
    slug: 'agency-automation',
    title: 'Agency Automation',
    description: 'Scale your agency operations with client management, project automation, and reporting systems.',
    features: [
      'Client onboarding and asset collection',
      'Project management task automation',
      'Client reporting with branded templates',
      'Time tracking and billing automation'
    ],
    icon: AgencyIcon,
    details: {
      fullDescription: 'Agencies often die from operational drag. We build the systems that allow your agency to scale. From automated client onboarding and asset collection to recurring reporting and billing, we create a standardized operating environment that ensures consistent delivery and happy clients.',
      benefits: [
        'Standardize project delivery across all clients',
        'Automate monthly reporting to prove ROI',
        'Speed up client onboarding by 50% or more',
        'Ensure accurate billing and faster payments'
      ],
      process: [
        'Operations Review: We analyze your fulfillment process.',
        'System Architecture: We design a scalable agency OS.',
        'Tool Integration: We connect your PM, CRM, and billing tools.',
        'Team Training: We teach your project managers the new workflow.'
      ]
    }
  }
];
