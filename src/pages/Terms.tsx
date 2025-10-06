import { Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '../components/shared/Button';

export function Terms() {
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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-600 mb-8">Last Updated: September 30, 2025</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-700 mb-4">
              By accessing or using FydBak ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you disagree with any part of the terms, you may not access the Service.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-slate-700 mb-4">
              FydBak is an AI-powered conversational survey platform that enables managers to collect feedback
              from team members through chat-based interactions. The Service includes:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Survey creation and management tools</li>
              <li>AI-powered response analysis and clarification</li>
              <li>Automated summary generation</li>
              <li>Data export and analytics features</li>
              <li>Custom branding options (Pro Plus tier)</li>
              <li>Survey duration controls and automatic closure</li>
              <li>Respondent data export (with PII safeguards)</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Survey & Feedback Use</h2>
            <p className="text-slate-700 mb-4">
              Managers may create surveys, define survey goals, and collect responses. You agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Surveys may include optional fields for name/email/phone; FydBak does not predefine these</li>
              <li><strong>If collecting PII, managers are responsible for ensuring lawful usage and consent</strong></li>
              <li>Managers must comply with all applicable privacy laws (GDPR, CCPA, etc.)</li>
              <li>Misuse of respondent data may result in account termination</li>
              <li>Custom thank-you messages must adhere to community standards (no hate, harassment, or abuse)</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Survey Duration and Closure</h2>
            <p className="text-slate-700 mb-4">
              Survey lifecycle management includes:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Surveys may expire automatically based on configured duration or be closed manually</li>
              <li>Once closed, a branded "thank-you" screen appears for respondents</li>
              <li>Managers may customize thank-you messages (subject to moderation)</li>
              <li>FydBak may moderate or disable thank-you messages that violate our policies</li>
              <li>Closed surveys remain accessible to managers for data analysis</li>
              <li>No new responses can be submitted to closed surveys</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Respondent List Exports</h2>
            <p className="text-slate-700 mb-4">
              Export functionality is subject to the following terms:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Export is restricted to verified manager accounts</li>
              <li>Managers may only export data explicitly collected via survey questions</li>
              <li>PII export (email, phone, name) triggers warnings and requires manager acknowledgment</li>
              <li><strong>FydBak disclaims liability for any misuse of exported data</strong></li>
              <li>Managers must have lawful basis and consent for data export and usage</li>
              <li>Export logs are maintained for security and compliance</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Account Registration</h2>
            <p className="text-slate-700 mb-4">
              You must register for an account to use manager features. You agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Subscription Plans and Billing</h2>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4.1 Subscription Tiers</h3>
            <p className="text-slate-700 mb-4">
              FydBak offers three subscription tiers: Free, Pro ($15/month), and Pro Plus ($29/month).
              Each tier includes different features and usage limits as described on our Pricing page.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4.2 Billing and Payment</h3>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Paid subscriptions are billed monthly in advance</li>
              <li>All fees are in U.S. Dollars (USD)</li>
              <li>Payment is processed through Stripe, our payment processor</li>
              <li>You authorize us to charge your payment method on a recurring basis</li>
              <li>Prices are subject to change with 30 days notice</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4.3 Overage Charges</h3>
            <p className="text-slate-700 mb-4">
              If you exceed your monthly response limit, additional responses are charged at $0.25 per response
              (including AI summary). Overage charges are billed at the end of your billing cycle. You can
              monitor your usage in real-time from your dashboard.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4.4 Refund Policy</h3>
            <p className="text-slate-700 mb-4">
              Subscription fees are non-refundable except as required by law. Overage charges are final once incurred.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Acceptable Use</h2>
            <p className="text-slate-700 mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe intellectual property rights</li>
              <li>Transmit harmful, threatening, or harassing content</li>
              <li>Collect personal information without consent</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Share your account credentials with others</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. AI-Generated Content</h2>
            <p className="text-slate-700 mb-4">
              The Service uses artificial intelligence to analyze responses and generate summaries. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>AI-generated content may not always be accurate or complete</li>
              <li>You should review AI-generated summaries before making decisions</li>
              <li>We are not liable for actions taken based on AI-generated content</li>
              <li>AI analysis is provided "as is" without warranties</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Data Ownership and Rights</h2>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.1 Your Content</h3>
            <p className="text-slate-700 mb-4">
              You retain all rights to the survey questions, responses, and data you create or collect through
              the Service ("Your Content"). You grant us a license to use Your Content solely to provide and
              improve the Service.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.2 Our Intellectual Property</h3>
            <p className="text-slate-700 mb-4">
              The Service, including its design, features, and functionality, is owned by FydBak and protected
              by intellectual property laws. You may not copy, modify, or create derivative works without permission.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Cancellation and Termination</h2>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8.1 Cancellation by You</h3>
            <p className="text-slate-700 mb-4">
              You may cancel your subscription at any time from your billing settings. Cancellation takes effect
              at the end of your current billing period. You will retain access until that date.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8.2 Termination by Us</h3>
            <p className="text-slate-700 mb-4">
              We may suspend or terminate your account immediately if you:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Violate these Terms</li>
              <li>Fail to pay fees when due</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Abuse or misuse the Service</li>
              <li>Misuse respondent PII or violate data privacy laws</li>
              <li>Post inappropriate or offensive thank-you messages</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8.3 Effect of Termination</h3>
            <p className="text-slate-700 mb-4">
              Upon termination, your right to use the Service ceases immediately. We will retain your data for
              30 days to allow for export, after which it may be permanently deleted.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Liability and Warranties</h2>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">9.1 Disclaimer of Warranties</h3>
            <p className="text-slate-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">9.2 Limitation of Liability</h3>
            <p className="text-slate-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOTIIV SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS
              INTERRUPTION ARISING FROM YOUR USE OF THE SERVICE.
            </p>
            <p className="text-slate-700 mb-4">
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. Indemnification</h2>
            <p className="text-slate-700 mb-4">
              You agree to indemnify and hold harmless FydBak from any claims, damages, losses, or expenses
              (including legal fees) arising from your use of the Service, violation of these Terms, or
              infringement of third-party rights.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">14. Data Security and Privacy</h2>
            <p className="text-slate-700 mb-4">
              We implement reasonable security measures to protect your data. However, no system is completely
              secure. Please review our Privacy Policy for details on how we collect, use, and protect your information.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">15. Third-Party Services</h2>
            <p className="text-slate-700 mb-4">
              The Service integrates with third-party services including:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Stripe for payment processing</li>
              <li>OpenAI or Anthropic for AI analysis</li>
              <li>Supabase for data storage and authentication</li>
            </ul>
            <p className="text-slate-700 mb-4">
              Your use of these services is subject to their respective terms and privacy policies.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">16. Modifications to Terms</h2>
            <p className="text-slate-700 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes
              via email or through the Service. Your continued use after changes constitutes acceptance of the
              modified Terms.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">17. Governing Law and Disputes</h2>
            <p className="text-slate-700 mb-4">
              These Terms are governed by the laws of the United States. Any disputes shall be resolved through
              binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">18. Contact Information</h2>
            <p className="text-slate-700 mb-4">
              For questions about these Terms, please contact us at:
            </p>
            <p className="text-slate-700 mb-4">
              <strong>Email:</strong> legal@fydbak.com<br />
              <strong>Mail:</strong> FydBak Legal Department, [Your Address]
            </p>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                By using FydBak, you acknowledge that you have read, understood, and agree to be bound by
                these Terms of Service.
              </p>
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
