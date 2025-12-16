import { Service } from '../types';
import WorkflowIcon from '../components/icons/WorkflowIcon';
import ChatbotIcon from '../components/icons/ChatbotIcon';
import CRMIcon from '../components/icons/CRMIcon';
import LeadGenIcon from '../components/icons/LeadGenIcon';

export const services: Service[] = [
  {
    id: 'n8n-workflow',
    title: 'N8N Workflow Automation',
    description: 'Powerful workflow automation connecting hundreds of applications with complex, multi-step processes that run 24/7.',
    features: [
      'Data synchronization between multiple platforms',
      'Automated email sequences and follow-up campaigns',
      'Custom API integrations for any web service',
      'Real-time reporting and automated analytics'
    ],
    icon: WorkflowIcon
  },
  {
    id: 'ai-chatbots',
    title: 'AI-Powered Chatbots',
    description: 'Intelligent AI chatbots that handle customer inquiries, qualify leads, book appointments, and provide 24/7 support.',
    features: [
      'Natural language understanding for conversations',
      'Lead qualification and appointment booking',
      'FAQ answering from custom knowledge base',
      'CRM integration with automatic contact creation'
    ],
    icon: ChatbotIcon
  },
  {
    id: 'crm-integrations',
    title: 'CRM Integrations',
    description: 'Seamlessly connect and automate your CRM systems to ensure no lead falls through the cracks.',
    features: [
      'HubSpot, Salesforce, GoHighLevel, and more',
      'Automatic lead capture and scoring',
      'Automated follow-up sequences',
      'Customer lifecycle automation'
    ],
    icon: CRMIcon
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation Automation',
    description: 'Automated systems that continuously generate, capture, nurture, and qualify leads for your business.',
    features: [
      'Landing pages with automated form processing',
      'Email marketing and drip campaigns',
      'Social media lead capture automation',
      'Analytics dashboards to track performance'
    ],
    icon: LeadGenIcon
  }
];
