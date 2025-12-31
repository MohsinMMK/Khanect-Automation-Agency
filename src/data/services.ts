import { Service } from '../types';
import WorkflowIcon from '../components/icons/WorkflowIcon';
import ChatbotIcon from '../components/icons/ChatbotIcon';
import CRMIcon from '../components/icons/CRMIcon';
import LeadGenIcon from '../components/icons/LeadGenIcon';

export const services: Service[] = [
  {
    id: 'n8n-workflow',
    slug: 'n8n-workflow-automation',
    title: 'N8N Workflow Automation',
    description: 'Powerful workflow automation connecting hundreds of applications with complex, multi-step processes that run 24/7.',
    features: [
      'Data synchronization between multiple platforms',
      'Automated email sequences and follow-up campaigns',
      'Custom API integrations for any web service',
      'Real-time reporting and automated analytics'
    ],
    icon: WorkflowIcon,
    details: {
      fullDescription: 'Our N8N workflow automation service acts as the digital nervous system for your business. We design and deploy robust, self-healing workflows that connect your disparayte apps—CRM, email, project management, and more—into a cohesive ecosystem. By eliminating manual data entry and repetitive tasks, we free your team to focus on high-value strategy while ensuring critical processes run flawlessly 24/7.',
      benefits: [
        'Reduce operational costs by automating manual tasks',
        'Eliminate human error in data processing',
        'Scale operations without adding headcount',
        'Gain real-time visibility into business performance'
      ],
      process: [
        'Discovery & Mapping: We audit your current workflows to identify bottlenecks.',
        'Solution Design: We architect a custom N8N workflow tailored to your stack.',
        'Development & Integration: We build and connect your APIs securely.',
        'Testing & Handover: We stress-test the system and provide full documentation.'
      ]
    }
  },
  {
    id: 'ai-chatbots',
    slug: 'ai-powered-chatbots',
    title: 'AI-Powered Chatbots',
    description: 'Intelligent AI chatbots that handle customer inquiries, qualify leads, book appointments, and provide 24/7 support.',
    features: [
      'Natural language understanding for conversations',
      'Lead qualification and appointment booking',
      'FAQ answering from custom knowledge base',
      'CRM integration with automatic contact creation'
    ],
    icon: ChatbotIcon,
    details: {
      fullDescription: 'Transform your customer experience with our AI-powered chatbots that go far beyond simple FAQ responses. Utilizing advanced LLMs, our agents serve as intelligent first-line responders that can qualify leads, schedule appointments, and resolve complex support tickets instantly. They are trained specifically on your business knowledge base, ensuring accurate, on-brand responses at any time of day.',
      benefits: [
        'Provide instant 24/7 customer support',
        'Qualify leads automatically before sales calls',
        'Reduce support ticket volume by up to 60%',
        'Seamlessly book meetings directly into your calendar'
      ],
      process: [
        'Knowledge Base Creation: We aggregate your documents and FAQs.',
        'Agent Configuration: We define the AI\'s persona, tone, and guardrails.',
        'Integration: We connect the bot to your website and CRM.',
        'Optimization: We monitor conversations and refine performance.'
      ]
    }
  },
  {
    id: 'crm-integrations',
    slug: 'crm-integrations',
    title: 'CRM Integrations',
    description: 'Seamlessly connect and automate your CRM systems to ensure no lead falls through the cracks.',
    features: [
      'HubSpot, Salesforce, GoHighLevel, and more',
      'Automatic lead capture and scoring',
      'Automated follow-up sequences',
      'Customer lifecycle automation'
    ],
    icon: CRMIcon,
    details: {
      fullDescription: 'Your CRM should be an engine of growth, not a static database. We specialize in deep CRM integrations that automate the entire customer lifecycle. From the moment a lead is captured, our systems automatically score, categorize, and nurture them based on their behavior, ensuring your sales team only focuses on the hottest prospects.',
      benefits: [
        'Ensure 100% accurate data across all systems',
        'Revive cold leads with automated reactivation campaigns',
        'Standardize sales processes for consistent results',
        'Get a unified view of every customer interaction'
      ],
      process: [
        'Audit: We review your current CRM setup and data health.',
        'Strategy: We map out the ideal customer journey and touchpoints.',
        'Implementation: We build the automations and data pipelines.',
        'Training: We show your team how to leverage the new system.'
      ]
    }
  },
  {
    id: 'lead-generation',
    slug: 'lead-generation-automation',
    title: 'Lead Generation Automation',
    description: 'Automated systems that continuously generate, capture, nurture, and qualify leads for your business.',
    features: [
      'Landing pages with automated form processing',
      'Email marketing and drip campaigns',
      'Social media lead capture automation',
      'Analytics dashboards to track performance'
    ],
    icon: LeadGenIcon,
    details: {
      fullDescription: 'Stop chasing leads and let them come to you. Our lead generation automation builds a self-sustaining pipeline that captures interest from multiple channels—web, social, and email—and nurtures it into conversion. We implement smart capture forms, personalized drip campaigns, and behavior-based triggers that deliver the right message at the right time.',
      benefits: [
        'Increase conversion rates with instant follow-ups',
        'Nurture prospects automatically over long periods',
        'Track ROI for every marketing channel',
        'Generate a predictable stream of qualified appointments'
      ],
      process: [
        'Funnel Design: We architect high-converting lead magnets and landing pages.',
        'Automation Setup: We configure email sequences and tracking pixels.',
        'Launch: We go live and monitor traffic and conversion metrics.',
        'Optimize: We A/B test and refine to maximize lead quality.'
      ]
    }
  }
];
