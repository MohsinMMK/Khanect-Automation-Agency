import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">Privacy Policy</h1>
        <div className="prose prose-lg prose-invert max-w-none text-gray-300 space-y-6">
          <p className="text-xl text-gray-400"><strong>Last Updated:</strong> December 7, 2025</p>
          
          <hr className="border-gray-800 my-8" />

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to <strong>Khanect AI Automation Agency</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it.
            </p>
            <p>
              By using our services, website, or communicating with us via WhatsApp, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when you interact with our services or automation workflows.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Personal Contact Details:</strong> Name, phone number, email address, and business details.</li>
              <li><strong>Communication Data:</strong> When you contact us via WhatsApp or email, we receive your message content, phone number, and profile name.</li>
              <li><strong>Technical Data:</strong> We may process data related to the automation services we build for you, including API keys, workflow logs, and specific business inputs required to function.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide, operate, and maintain our AI automation services.</li>
              <li>Process and reply to inquiries via our WhatsApp bots and AI agents.</li>
              <li>Debug and improve our workflows (e.g., fixing issues in n8n or SQL databases).</li>
              <li>Send administrative information, such as invoices, updates, or technical alerts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Sharing Your Information (Third-Party Processors)</h2>
            <p>
              We do not sell your personal information. However, strictly for the purpose of operational functionality, data may be processed by the following third-party infrastructure providers:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Automation Infrastructure:</strong> We use n8n to host and execute our automation workflows.</li>
              <li><strong>AI & LLM Providers:</strong> Text inputs and queries may be processed by AI models (such as OpenAI or Anthropic) to generate intelligent responses.</li>
              <li><strong>Messaging Platforms:</strong> WhatsApp messages are processed via Meta Platforms, Inc. to ensure delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data during transmission and storage. However, please be aware that no method of transmission over the internet (including email and WhatsApp) is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Privacy Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request that we correct or delete your personal data.</li>
              <li>Opt-out of any marketing communications.</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at <a href="mailto:connect@khanect.com" className="text-[#14b8a6] hover:underline">connect@khanect.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="bg-white/5 p-6 rounded-xl mt-4 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Khanect AI Automation Agency</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-xl mr-3">📧</span>
                  <div>
                    <span className="font-semibold text-white block">Email:</span>
                    <a href="mailto:connect@khanect.com" className="text-[#14b8a6] hover:underline">connect@khanect.com</a>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-800 my-8" />
        </div>
      </div>
    </div>
  );
}
