import { Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/shared/Button';

export function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">FydBak</span>
            </Link>
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <p className="text-slate-600 mb-8">Last Updated: September 30, 2025</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-slate-700 mb-4">
              FydBak ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you use our AI-powered survey
              platform.
            </p>
            <p className="text-slate-700 mb-4">
              By using FydBak, you agree to the collection and use of information in accordance with this policy.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2.1 Information You Provide</h3>
            <p className="text-slate-700 mb-4">We collect information that you voluntarily provide:</p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li><strong>Account Information:</strong> Email address, password (encrypted), and profile details</li>
              <li><strong>Survey Content:</strong> Survey questions, titles, descriptions, and settings you create</li>
              <li><strong>Response Data:</strong> Survey responses submitted by team members, including optional names</li>
              <li><strong>Payment Information:</strong> Billing details processed through Stripe (we do not store credit card numbers)</li>
              <li><strong>Communication Data:</strong> Messages you send to our support team</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <p className="text-slate-700 mb-4">We automatically collect certain information when you use our Service:</p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li><strong>Usage Data:</strong> Features used, time spent, surveys created, responses received</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed, referring URLs</li>
              <li><strong>Cookies:</strong> Session cookies for authentication and functionality</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Respondent Identity & Consent</h2>
            <p className="text-slate-700 mb-4">
              If a manager includes questions requesting personally identifiable information (PII) such as name,
              email, or phone number:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Clear disclosure is provided to respondents (e.g., "This info may be used for draws or follow-up")</li>
              <li>Respondents may skip such fields without penalty</li>
              <li>Export of PII is restricted to the survey's original manager</li>
              <li>Managers must have lawful basis and consent for any PII collection</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Survey Lifecycle</h2>
            <p className="text-slate-700 mb-4">
              Surveys have configurable lifecycles with the following behaviors:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Each survey can be configured to auto-close after a set duration or remain open indefinitely</li>
              <li>Managers can manually close surveys at any time</li>
              <li>Once closed, surveys are no longer accessible for response submission</li>
              <li>Closed surveys redirect to a branded, read-only thank-you page</li>
              <li>Custom thank-you messages may be set by managers (subject to our Acceptable Use Policy)</li>
              <li>Data from closed surveys remains accessible to managers for analysis and export</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. How We Use Your Information</h2>
            <p className="text-slate-700 mb-4">We use collected information for the following purposes:</p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li><strong>Service Delivery:</strong> To provide and maintain the survey platform</li>
              <li><strong>AI Analysis:</strong> To process responses through AI for clarifications and summaries</li>
              <li><strong>Billing:</strong> To process payments and manage subscriptions</li>
              <li><strong>Communication:</strong> To send service updates, security alerts, and support responses</li>
              <li><strong>Improvement:</strong> To analyze usage patterns and improve features</li>
              <li><strong>Security:</strong> To detect, prevent, and address fraud or security issues</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Respondent Data Export</h2>
            <p className="text-slate-700 mb-4">
              Managers may export respondent data under the following conditions:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li><strong>Export Availability:</strong> Only available if survey explicitly collects PII</li>
              <li><strong>Manager Responsibility:</strong> Managers are solely responsible for lawful use of exported data</li>
              <li><strong>Consent Requirement:</strong> Managers must ensure they have respondent consent for data usage (e.g., giveaways, follow-up contact)</li>
              <li><strong>Audit Trail:</strong> All PII exports are logged for compliance and security purposes</li>
              <li><strong>Warnings:</strong> Managers receive explicit warnings before exporting PII</li>
              <li><strong>Limited Access:</strong> Only the survey creator can export respondent data</li>
            </ul>
            <p className="text-slate-700 mb-4">
              FydBak disclaims liability for misuse of exported data. Managers using export features must comply with
              all applicable privacy laws including GDPR, CCPA, and other regional regulations.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. AI Processing and Third-Party Services</h2>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4.1 AI Analysis</h3>
            <p className="text-slate-700 mb-4">
              We use artificial intelligence services (OpenAI or Anthropic) to analyze survey responses and
              generate insights. When responses are processed:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Response text is sent to our AI provider's API</li>
              <li>The AI provider may temporarily process this data according to their policies</li>
              <li>We do not train AI models on your data</li>
              <li>AI-generated summaries are stored in our database</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4.2 Third-Party Services</h3>
            <p className="text-slate-700 mb-4">We work with the following third-party service providers:</p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li><strong>Supabase:</strong> Database hosting and authentication</li>
              <li><strong>Stripe:</strong> Payment processing (see Stripe's privacy policy)</li>
              <li><strong>OpenAI/Anthropic:</strong> AI analysis and response processing</li>
            </ul>
            <p className="text-slate-700 mb-4">
              These providers have their own privacy policies governing their use of your information.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Data Sharing and Disclosure</h2>
            <p className="text-slate-700 mb-4">We do not sell your personal information. We may share information in these situations:</p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.1 With Your Consent</h3>
            <p className="text-slate-700 mb-4">
              We share information when you give us explicit permission, such as when inviting team members
              to respond to surveys.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.2 Service Providers</h3>
            <p className="text-slate-700 mb-4">
              We share information with vendors who perform services on our behalf (hosting, payment processing,
              AI analysis) under confidentiality agreements.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.3 Legal Requirements</h3>
            <p className="text-slate-700 mb-4">
              We may disclose information if required by law, court order, or to protect our rights, safety,
              or the safety of others.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.4 Business Transfers</h3>
            <p className="text-slate-700 mb-4">
              If FydBak is acquired or merged, your information may be transferred to the new entity.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Data Security</h2>
            <p className="text-slate-700 mb-4">
              We implement appropriate technical and organizational measures to protect your information:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li><strong>Encryption:</strong> Data is encrypted in transit (TLS/SSL) and at rest</li>
              <li><strong>Access Controls:</strong> Row Level Security ensures users only access their own data</li>
              <li><strong>Authentication:</strong> Secure password hashing and session management</li>
              <li><strong>Monitoring:</strong> Regular security audits and vulnerability assessments</li>
              <li><strong>Backups:</strong> Regular encrypted backups for disaster recovery</li>
            </ul>
            <p className="text-slate-700 mb-4">
              However, no system is completely secure. We cannot guarantee absolute security of your information.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Data Retention</h2>
            <p className="text-slate-700 mb-4">
              We retain your information for as long as necessary to provide the Service and comply with legal obligations:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
              <li><strong>Deleted Accounts:</strong> Data retained for 30 days post-cancellation, then deleted</li>
              <li><strong>Legal Requirements:</strong> Some data may be retained longer for compliance</li>
              <li><strong>Backups:</strong> Deleted data may persist in backups for up to 90 days</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Your Privacy Rights</h2>
            <p className="text-slate-700 mb-4">
              Depending on your location, you may have the following rights:
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8.1 Access and Portability</h3>
            <p className="text-slate-700 mb-4">
              You can access and export your data at any time through your account settings or by contacting us.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8.2 Correction</h3>
            <p className="text-slate-700 mb-4">
              You can update your account information and survey data directly in the application.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8.3 Deletion</h3>
            <p className="text-slate-700 mb-4">
              You can request deletion of your account and all associated data by contacting privacy@fydbak.com.
              We will process your request within 30 days.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8.4 Opt-Out</h3>
            <p className="text-slate-700 mb-4">
              You can opt out of marketing emails by clicking "unsubscribe" in any email or updating your
              notification preferences.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8.5 GDPR Rights (EU Users)</h3>
            <p className="text-slate-700 mb-4">
              If you are in the European Economic Area, you have additional rights including:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Right to object to processing</li>
              <li>Right to restrict processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8.6 CCPA Rights (California Users)</h3>
            <p className="text-slate-700 mb-4">
              California residents have the right to:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Know what personal information is collected</li>
              <li>Know if personal information is sold or disclosed</li>
              <li>Opt out of sale of personal information (we do not sell data)</li>
              <li>Request deletion of personal information</li>
              <li>Not be discriminated against for exercising these rights</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Children's Privacy</h2>
            <p className="text-slate-700 mb-4">
              FydBak is not intended for users under 18 years of age. We do not knowingly collect information
              from children. If you believe we have collected information from a child, please contact us
              immediately.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. International Data Transfers</h2>
            <p className="text-slate-700 mb-4">
              Your information may be transferred to and processed in countries other than your country of
              residence. These countries may have different data protection laws. We ensure appropriate
              safeguards are in place for such transfers.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">14. Cookies and Tracking</h2>
            <p className="text-slate-700 mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
              <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics Cookies:</strong> Understand how you use the Service (can be disabled)</li>
            </ul>
            <p className="text-slate-700 mb-4">
              You can control cookies through your browser settings, but disabling some cookies may affect
              functionality.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">15. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Posting the updated policy with a new "Last Updated" date</li>
              <li>Sending you an email notification</li>
              <li>Displaying a notice in the application</li>
            </ul>
            <p className="text-slate-700 mb-4">
              Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">16. Contact Us</h2>
            <p className="text-slate-700 mb-4">
              For questions, concerns, or requests related to this Privacy Policy or your data, please contact:
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <p className="text-slate-900 font-semibold mb-2">Privacy Team</p>
              <p className="text-slate-700">
                <strong>Email:</strong> privacy@fydbak.com<br />
                <strong>Mail:</strong> FydBak Privacy Department<br />
                [Your Address]
              </p>
            </div>
            <p className="text-slate-700 mb-4">
              We will respond to your request within 30 days.
            </p>

            <div className="mt-12 pt-8 border-t border-slate-200 bg-green-50 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Your Privacy Matters</h4>
                  <p className="text-sm text-slate-700">
                    We are committed to transparency and protecting your privacy. If you have any questions
                    or concerns about how we handle your data, please don't hesitate to reach out. We're here to help.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 bg-white mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">FydBak</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-slate-600 hover:text-slate-900">Privacy Policy</Link>
              <Link to="/terms" className="text-slate-600 hover:text-slate-900">Terms of Service</Link>
              <Link to="/pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-6 text-center">
            &copy; 2025 FydBak. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
