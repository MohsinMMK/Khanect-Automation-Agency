import React from 'react';

export default function UserDataDeletion() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">User Data Deletion Instructions</h1>
        <div className="prose prose-lg prose-invert max-w-none text-gray-300 space-y-6">
          <p className="text-xl text-gray-400"><strong>Last Updated:</strong> January 23, 2026</p>
          
          <hr className="border-gray-800 my-8" />

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              At <strong>Khanect AI Automation Agency</strong> ("we," "our," or "us"), we respect your privacy and your right to control your personal information. This User Data Deletion Policy explains how you can request the deletion of your personal data that we have collected through our services, including our WhatsApp chatbots, AI agents, and automation workflows.
            </p>
            <p>
              This policy complies with Meta's Platform Policy requirements for applications integrated with WhatsApp Business API, Facebook Messenger, and other Meta services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. What Data We Collect</h2>
            <p>
              As outlined in our Privacy Policy, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Contact Details:</strong> Name, phone number, email address, business details</li>
              <li><strong>Communication Data:</strong> WhatsApp messages, email correspondence, message content, profile names</li>
              <li><strong>Technical Data:</strong> Workflow logs, API interactions, automation execution data</li>
              <li><strong>Appointment Data</strong> (if applicable): Booking details, preferences, scheduled appointments</li>
              <li><strong>Device Information:</strong> Platform type (WhatsApp, Messenger), timestamps</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Your Right to Data Deletion</h2>
            <p>
              Under data protection regulations and Meta's Platform Policy, you have the right to request deletion of your personal data at any time. We will honor your request within the timelines specified in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. How to Request Data Deletion</h2>
            <p>You can request deletion of your data through any of the following methods:</p>

            <div className="mt-4 mb-6">
              <h3 className="text-xl font-medium text-white mb-2">Method 1: Email Request (Recommended)</h3>
              <p>Send an email to: <strong><a href="mailto:connect@khanect.com" className="text-[#14b8a6] hover:underline">connect@khanect.com</a></strong></p>
              <p className="mt-2"><strong>Subject:</strong> Data Deletion Request - [Your Name/Phone Number]</p>
              <p className="mt-2 text-gray-400">Include the following information:</p>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>Your full name</li>
                <li>Phone number used with our WhatsApp service</li>
                <li>Email address (if applicable)</li>
                <li>Any account identifiers or service details</li>
                <li>Specify whether you want complete deletion or partial deletion</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-white mb-2">Method 2: WhatsApp Request</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Message our business WhatsApp number (the one you've been communicating with)</li>
                <li>Type: <strong>"I want to delete my data"</strong></li>
                <li>Our team will guide you through the verification process</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-white mb-2">Method 3: Through Meta/Facebook</h3>
              <p>If you accessed our services through a Meta-integrated app:</p>
              <ol className="list-decimal pl-6 space-y-1 mt-2">
                <li>Go to your Facebook Settings</li>
                <li>Navigate to <strong>"Apps and Websites"</strong></li>
                <li>Find <strong>"Khanect AI Automation Agency"</strong> in the list</li>
                <li>Click <strong>"Remove"</strong> to revoke access</li>
                <li>Your data deletion request will be automatically processed</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Verification Process</h2>
            <p>
              To protect your privacy and prevent unauthorized deletion requests, we will verify your identity before processing the deletion. Verification may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Phone number verification (OTP sent via WhatsApp or SMS)</li>
              <li>Email confirmation</li>
              <li>Security questions related to your service usage</li>
              <li>Facebook account verification (for Meta-integrated services)</li>
            </ul>
            <p className="mt-4"><strong>Timeline:</strong> Identity verification typically takes 1-2 business days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Deletion Timeline</h2>
            <p>Once your request is verified, we will process your data deletion according to the following timeline:</p>
            
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-left border border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-700 font-semibold text-white">Action</th>
                    <th className="px-6 py-3 border-b border-gray-700 font-semibold text-white">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 text-gray-300">Request Acknowledgment</td>
                    <td className="px-6 py-4 text-gray-300">Within 24 hours</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-300">Identity Verification</td>
                    <td className="px-6 py-4 text-gray-300">1-2 business days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-300">Data Deletion Completion</td>
                    <td className="px-6 py-4 text-gray-300">Within 30 days (usually 7-14 days)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-300">Confirmation Email</td>
                    <td className="px-6 py-4 text-gray-300">Sent upon completion</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. What Gets Deleted</h2>
            <p>When you request data deletion, we will permanently remove:</p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-semibold text-white mb-2">✅ Personal Contact Information</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Name, phone number, email address</li>
                  <li>Profile pictures and display names</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">✅ Communication Records</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>WhatsApp message history and conversation logs</li>
                  <li>Email correspondence</li>
                  <li>Chat transcripts with our AI agents</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">✅ Automation & Technical Data</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Workflow execution logs related to your account</li>
                  <li>API interaction data</li>
                  <li>Session data and usage analytics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">✅ Appointment/Service Data (if applicable)</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Booking history and preferences</li>
                  <li>Service requests and configurations</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data We May Retain (Legal Obligations)</h2>
            <p>In certain limited circumstances, we may retain some data for legal or business purposes:</p>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-1">🔒 Legal Compliance:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Transaction records for tax and accounting purposes (retained for 7 years as required by Indian law)</li>
                  <li>Documentation related to legal disputes or investigations</li>
                  <li>Records required for fraud prevention and security purposes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">🔒 Aggregated/Anonymized Data:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Non-identifiable statistical data used for service improvement</li>
                  <li>Anonymized usage patterns that cannot be linked back to you</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 italic text-sm">Note: Any retained data will be fully anonymized and cannot be used to identify you personally.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Third-Party Data Deletion</h2>
            <p>We will also request deletion of your data from our third-party service providers, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Meta Platforms (WhatsApp):</strong> Message logs, webhook data</li>
              <li><strong>n8n (Automation Platform):</strong> Workflow execution logs</li>
              <li><strong>AI Providers (OpenAI, Anthropic):</strong> Processed queries and conversation history</li>
              <li><strong>Cloud Storage:</strong> Backup files containing your data</li>
            </ul>
            <p className="mt-4 italic text-sm">Note: Third-party deletion timelines may vary based on their respective data retention policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Consequences of Data Deletion</h2>
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg">
              <p className="font-semibold text-red-200 mb-2">⚠️ Important: Please be aware that once your data is deleted:</p>
              <ul className="list-disc pl-6 space-y-1 text-red-200/80">
                <li>You will lose access to our services</li>
                <li>Your message history and conversation logs will be permanently removed</li>
                <li>Any active automation workflows configured for you may be disabled</li>
                <li>You cannot recover deleted data</li>
                <li>If you have active service agreements, they may be affected</li>
                <li>You will need to re-register and provide information again to use our services in the future</li>
              </ul>
              <p className="mt-4 font-medium text-red-200">We recommend: Complete or cancel any active service agreements before requesting data deletion.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Partial Deletion Requests</h2>
            <p>If you only want to delete specific data rather than everything, please specify in your request:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Message History Only:</strong> We can delete conversation logs while keeping service configuration data</li>
              <li><strong>Contact Information Only:</strong> We can remove your personal details while keeping anonymized service usage data</li>
              <li><strong>Specific Time Periods:</strong> Request deletion of data from particular date ranges</li>
            </ul>
            <p className="mt-2">Please clearly specify your preference when submitting your deletion request.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Confirmation of Deletion</h2>
            <p>Once your data deletion is complete, you will receive a confirmation email containing:</p>
            <div className="mt-2 pl-4 border-l-2 border-[#14b8a6]">
              <h4 className="font-semibold text-white mb-2">📧 Confirmation Details:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Unique confirmation reference number</li>
                <li>Deletion completion date</li>
                <li>List of data types that were deleted</li>
                <li>Information about any data retained for legal purposes (if applicable)</li>
                <li>Contact information for follow-up questions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Automated Deletion (Meta App Removal)</h2>
            <p>If you remove our app through Facebook/Meta settings:</p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>We automatically receive a deletion request callback from Meta</li>
              <li>Your data is queued for deletion within 24 hours</li>
              <li>Complete deletion is processed within 30 days</li>
              <li>You receive a confirmation email (if we have your email address)</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Data Deletion for Deceased Users</h2>
            <p>If you are the legal representative of a deceased user and wish to request data deletion:</p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>Contact us at: <strong><a href="mailto:connect@khanect.com" className="hover:text-[#14b8a6]">connect@khanect.com</a></strong></li>
              <li>Subject: "Deceased User Data Deletion Request"</li>
              <li>Provide:
                <ul className="list-disc pl-6 mt-1">
                  <li>Copy of death certificate</li>
                  <li>Proof of legal authority (will, court order, etc.)</li>
                  <li>Deceased user's phone number and service details</li>
                </ul>
              </li>
              <li>We will process the request within 30 days upon verification</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Complaints and Appeals</h2>
            <p>If you are not satisfied with how we handled your data deletion request, you can:</p>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Internal Appeal:</h3>
                <ul className="space-y-1 text-sm">
                  <li><strong>Email:</strong> <a href="mailto:connect@khanect.com" className="hover:text-[#14b8a6]">connect@khanect.com</a></li>
                  <li><strong>Subject:</strong> "Data Deletion Complaint"</li>
                  <li>We will review and respond within 7 business days</li>
                </ul>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">External Complaints:</h3>
                <ul className="space-y-1 text-sm">
                  <li><strong>Meta/Facebook Data Protection:</strong> <a href="https://www.facebook.com/help/contact/540977946302970" target="_blank" rel="noopener noreferrer" className="text-[#14b8a6] hover:underline">Facebook Help</a></li>
                  <li><strong>Ministry of Electronics and IT (India):</strong> <a href="https://www.meity.gov.in/" target="_blank" rel="noopener noreferrer" className="text-[#14b8a6] hover:underline">meity.gov.in</a></li>
                  <li><strong>National Consumer Helpline (India):</strong> 1800-11-4000</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">16. Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white">Q: How long does data deletion take?</h4>
                <p><strong>A:</strong> Complete deletion is processed within 30 days, but is usually completed within 7-14 business days.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Q: Can I recover my data after deletion?</h4>
                <p><strong>A:</strong> No. Data deletion is permanent and irreversible. Please ensure you want to proceed before submitting your request.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Q: Is there a fee for data deletion?</h4>
                <p><strong>A:</strong> No. Data deletion is completely free of charge.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Q: Can I download my data before deletion?</h4>
                <p><strong>A:</strong> Yes. Please submit a "Data Export Request" to <strong>mohsinkhanking1999@gmail.com</strong> before requesting deletion. We will provide your data within 7 days.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Q: Will deleting my data affect active service agreements?</h4>
                <p><strong>A:</strong> Yes, it may. We recommend completing or properly terminating any active services before requesting data deletion.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Q: What if I used multiple phone numbers with your service?</h4>
                <p><strong>A:</strong> Please submit separate requests for each phone number, or mention all numbers in a single request.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">17. Technical Implementation (For Meta Compliance)</h2>
            <p>For compliance with Meta's Platform Policy, our application implements the Data Deletion Callback URL:</p>
            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm border border-gray-800 mt-2">
              <p className="mb-2"><span className="text-[#14b8a6]">Endpoint:</span> https://khanect.com/webhook/data-deletion</p>
              <p className="text-gray-500 mb-2">// Response Format:</p>
              <pre className="text-gray-300 overflow-x-auto">
{`{
  "url": "https://khanect.com/deletion-status?id={deletion-id}",
  "confirmation_code": "{unique-confirmation-code}"
}`}
              </pre>
            </div>
            <p className="mt-2 text-sm text-gray-400">Users can check their deletion request status at the provided URL.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">18. Updates to This Policy</h2>
            <p>
              We may update this User Data Deletion Policy to reflect:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Changes in legal requirements</li>
              <li>Improvements to our deletion process</li>
              <li>New data categories or services</li>
            </ul>
            <p className="mt-4">
              When we make material changes, we will update the "Last Updated" date at the top of this document and notify affected users via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">19. Contact Information</h2>
            <p>For data deletion requests or questions about this policy, please contact us:</p>
            <div className="bg-white/5 p-6 rounded-xl mt-4 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Khanect AI Automation Agency</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-xl mr-3">📧</span>
                  <div>
                    <span className="font-semibold text-white block">Email:</span>
                    <a href="mailto:mohsinkhanking1999@gmail.com" className="text-[#14b8a6] hover:underline">mohsinkhanking1999@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-3">💬</span>
                  <div>
                    <span className="font-semibold text-white block">WhatsApp:</span>
                    <span className="text-gray-300">Message us on our business number</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-3">📍</span>
                  <div>
                    <span className="font-semibold text-white block">Location:</span>
                    <span className="text-gray-300">Hyderabad, Telangana, India</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-3">🕒</span>
                  <div>
                    <span className="font-semibold text-white block">Business Hours:</span>
                    <span className="text-gray-300">Monday - Saturday, 9:00 AM - 6:00 PM IST</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">20. Legal Compliance</h2>
            <p>This User Data Deletion Policy complies with:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Meta Platform Policy (Data Deletion Requirements)</li>
              <li>Information Technology Act, 2000 (India)</li>
              <li>Information Technology (Reasonable Security Practices and Procedures) Rules, 2011</li>
              <li>Digital Personal Data Protection Act, 2023 (India)</li>
              <li>General Data Protection Regulation (GDPR) principles</li>
            </ul>
          </section>

          <hr className="border-gray-800 my-8" />

          <p className="text-sm text-gray-500 text-center">
            Document Reference: KAI-UDDP-2026-001 | Effective Date: January 23, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
