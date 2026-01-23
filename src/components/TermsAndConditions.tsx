import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">Terms of Service</h1>
        <div className="prose prose-lg prose-invert max-w-none text-gray-300 space-y-6">
          <p className="text-xl text-gray-400"><strong>Last Updated:</strong> December 7, 2025</p>
          
          <hr className="border-gray-800 my-8" />

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to <strong>Khanect AI Automation Agency</strong> ("we," "our," or "us"). By accessing or using our website, AI automation services, or WhatsApp chatbots, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Services Provided</h2>
            <p>
              Khanect AI Automation Agency provides business process automation, AI chatbot development, and workflow integration services (utilizing tools such as n8n, SQL, and AI models).
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>We grant you a limited, non-exclusive, non-transferable license to use our services for your internal business purposes.</li>
              <li>We reserve the right to modify or discontinue any service at any time without prior notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
            <p>By using our services, you agree that:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>You will provide accurate and complete information when required.</li>
              <li>You will not use our services for any illegal or unauthorized purpose (including spamming via WhatsApp).</li>
              <li>You are responsible for the security of your own API keys and account credentials.</li>
              <li>You will not attempt to reverse engineer or disrupt our automation infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Tools & Dependencies</h2>
            <p>Our services rely on third-party platforms, including but not limited to Meta (WhatsApp), n8n, and OpenAI.</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>We are not responsible for service interruptions, data loss, or policy changes caused by these third-party providers.</li>
              <li>Your use of these platforms is also subject to their respective Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Payment and Refunds</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fees for our services are described in your specific service agreement or invoice.</li>
              <li>Payments are non-refundable unless otherwise explicitly stated in your service agreement.</li>
              <li>We reserve the right to suspend services for late or non-payment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <strong className="text-white">Our IP:</strong> All underlying code, workflow designs, and methodologies created by Khanect AI Automation Agency remain our intellectual property unless explicitly transferred in a written agreement.
              </div>
              <div>
                <strong className="text-white">Your IP:</strong> You retain all rights to the data and content you provide to us for processing.
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Khanect AI Automation Agency shall not be liable for any indirect, incidental, special, or consequential damages arising out of the use or inability to use our services, including but not limited to loss of profits, data, or business goodwill.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Termination</h2>
            <p>
              We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including if you breach these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Your continued use of the service following any changes signifies your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
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
