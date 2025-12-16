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
    id: 'automation-failure',
    question: 'What happens if an automation stops working?',
    answer: 'We build robust error handling into every automation, including notifications when issues occur. Our support packages include monitoring and maintenance. If an automation fails, we are alerted and can typically resolve issues within hours. Critical automations can have redundancy built in.'
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
    id: 'appointment-booking',
    question: 'Can the chatbot book appointments?',
    answer: 'Yes, our chatbots can be integrated with your calendar system such as Google Calendar, Calendly, or Acuity to book appointments directly during conversations. The chatbot can check availability, offer time slots, and confirm bookings without human intervention.'
  },
  {
    id: 'chatbot-limitations',
    question: 'What if the chatbot cannot answer a question?',
    answer: 'Our chatbots are designed to recognize when they cannot provide a satisfactory answer. In these cases, they can collect the visitor\'s contact information and notify your team, offer to connect with a human agent during business hours, or provide alternative resources or contact methods. We continuously improve the knowledge base based on unanswered questions.'
  },
  {
    id: 'payment-plans',
    question: 'Do you offer payment plans?',
    answer: 'Yes, we offer flexible payment options including monthly subscriptions and payment plans for larger projects. We can discuss payment terms during your consultation to find an arrangement that works for your budget.'
  },
  {
    id: 'contract-term',
    question: 'Is there a minimum contract term?',
    answer: 'For one-time projects, there is no ongoing commitment after the initial project is complete. For subscription packages, we typically recommend a 3-month minimum to see meaningful results, but we are flexible based on your needs.'
  },
  {
    id: 'ongoing-support',
    question: 'What is included in ongoing support?',
    answer: 'Ongoing support includes monitoring your automations, fixing any issues that arise, making minor adjustments and updates, regular check-in calls, and priority response for urgent issues. Specific inclusions vary by package level.'
  },
  {
    id: 'hipaa-compliance',
    question: 'Is healthcare automation HIPAA compliant?',
    answer: 'Yes, we design healthcare automations with HIPAA compliance in mind. This includes using compliant hosting providers, implementing proper data encryption, establishing Business Associate Agreements where required, and following best practices for handling Protected Health Information.'
  },
  {
    id: 'ecommerce-platforms',
    question: 'Which e-commerce platforms do you work with?',
    answer: 'We work with all major e-commerce platforms including Shopify, WooCommerce, BigCommerce, Magento, Amazon, eBay, and Etsy. We can also integrate with custom e-commerce solutions built on frameworks like Next.js or custom platforms.'
  }
];
