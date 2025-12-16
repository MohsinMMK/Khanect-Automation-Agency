import { FAQ } from '../types';

export const faqs: FAQ[] = [
  {
    id: 'what-is-automation',
    question: 'What is business automation?',
    answer: 'Business automation is the use of technology to perform repetitive tasks or processes with minimal human intervention. This includes workflows like sending emails, updating databases, processing orders, scheduling appointments, and managing customer communications. Automation saves time, reduces errors, and allows you to scale without proportionally increasing staff.'
  },
  {
    id: 'implementation-time',
    question: 'How long does it take to implement automation?',
    answer: 'Implementation timelines vary based on complexity. Simple automations can be completed in 1-2 weeks. More complex systems with multiple integrations typically take 4-8 weeks. Enterprise solutions may require 2-3 months for full implementation. We provide a specific timeline during your consultation based on your requirements.'
  },
  {
    id: 'technical-knowledge',
    question: 'Do I need technical knowledge to use the automations?',
    answer: 'No technical knowledge is required. We build automations that work in the background without your intervention. We also provide training on how to monitor and make minor adjustments. Our support team is available if you need any assistance.'
  },
  {
    id: 'tool-integration',
    question: 'Can you integrate with my existing tools?',
    answer: 'Yes, we can integrate with virtually any tool that has an API or webhook capability. N8n supports hundreds of applications natively, and we can build custom integrations for specialized software. During discovery, we will assess your current tech stack and confirm integration possibilities.'
  },
  {
    id: 'chatbot-learning',
    question: 'How does the AI chatbot learn about my business?',
    answer: 'We create a custom knowledge base for your chatbot by processing your existing content including your website, FAQs, product documentation, and service information. This information is converted into embeddings and stored in a vector database. The chatbot uses this knowledge to answer questions accurately about your specific business.'
  },
  {
    id: 'ongoing-support',
    question: 'What is included in ongoing support?',
    answer: 'Ongoing support includes monitoring your automations, fixing any issues that arise, making minor adjustments and updates, regular check-in calls, and priority response for urgent issues. Specific inclusions vary by package level.'
  }
];
