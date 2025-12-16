import { ProcessStep } from '../types';

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: 'Discovery Consultation',
    description: 'Free discovery call to understand your business, current workflows, pain points, and goals. We discuss your daily operations and identify time-consuming manual tasks.',
    duration: '30-45 minutes'
  },
  {
    number: 2,
    title: 'Workflow Audit & Strategy',
    description: 'Thorough audit of your current processes. We map out workflows, identify bottlenecks, and create a prioritized automation roadmap with expected ROI.',
    duration: '1-2 weeks'
  },
  {
    number: 3,
    title: 'Design & Development',
    description: 'Our team designs and builds your custom automations using n8n and other tools. We keep you updated on progress and prepare comprehensive documentation.',
    duration: '2-6 weeks'
  },
  {
    number: 4,
    title: 'Testing & Quality Assurance',
    description: 'Rigorous testing with various scenarios to ensure reliability. We test edge cases, error handling, and integration points in a staging environment.',
    duration: '1 week'
  },
  {
    number: 5,
    title: 'Deployment & Training',
    description: 'Deploy automations to production and provide comprehensive training to your team. Includes video recordings and documentation for future reference.',
    duration: '1 week'
  },
  {
    number: 6,
    title: 'Ongoing Support & Optimization',
    description: 'Monitor performance, handle issues, and continuously optimize based on real-world usage. Regular check-ins and priority response times included.',
    duration: 'Ongoing'
  }
];
