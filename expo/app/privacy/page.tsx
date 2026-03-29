import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | VyBzzZ',
  description: 'VyBzzZ Privacy Policy and GDPR compliance information',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              VyBzzZ ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our
              concert streaming platform and mobile application.
            </p>
            <p className="text-gray-700 mt-4">
              We are compliant with the General Data Protection Regulation (GDPR) and French data protection laws.
            </p>
          </section>

          {/* Data Controller */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data Controller</h2>
            <p className="text-gray-700">
              The data controller responsible for your personal data is:
            </p>
            <address className="not-italic text-gray-700 mt-2">
              VyBzzZ SAS<br />
              [Company Address]<br />
              Email: privacy@vybzzz.com<br />
              DPO: dpo@vybzzz.com
            </address>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Account Information</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Profile picture (optional)</li>
              <li>Password (encrypted)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Artist Information</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Stage name</li>
              <li>Biography</li>
              <li>Social media handles (Instagram, TikTok, YouTube)</li>
              <li>Spotify artist ID</li>
              <li>Stripe Connect account information</li>
              <li>Bank account details (stored by Stripe)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.3 Transaction Data</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Purchase history (tickets, tips)</li>
              <li>Payment information (processed by Stripe)</li>
              <li>Transaction amounts and dates</li>
              <li>Refund information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.4 Usage Data</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and features used</li>
              <li>Time and date of visits</li>
              <li>Viewing history (concerts watched)</li>
            </ul>
          </section>

          {/* Legal Basis */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
            <p className="text-gray-700">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li><strong>Contract Performance:</strong> To provide our services and process payments</li>
              <li><strong>Legal Obligation:</strong> To comply with financial regulations and tax laws</li>
              <li><strong>Legitimate Interest:</strong> To improve our services, prevent fraud, and ensure security</li>
              <li><strong>Consent:</strong> For marketing communications (you can withdraw consent at any time)</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide access to live concert streams</li>
              <li>Process ticket purchases and tips</li>
              <li>Manage artist payouts</li>
              <li>Send transactional emails (order confirmations, payout notifications)</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations (tax reporting, financial records)</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing</h2>
            <p className="text-gray-700">
              We share your data with the following third parties:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li><strong>Stripe:</strong> Payment processing and payouts (PCI-DSS compliant)</li>
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>Vercel:</strong> Hosting and content delivery</li>
              <li><strong>Sentry:</strong> Error monitoring (optional, anonymized data)</li>
              <li><strong>YouTube:</strong> Live streaming infrastructure</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We do not sell your personal data to third parties.
            </p>
          </section>

          {/* Your Rights (GDPR) */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights (GDPR)</h2>
            <p className="text-gray-700">
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li><strong>Right to Access (Art. 15):</strong> Request a copy of your data</li>
              <li><strong>Right to Rectification (Art. 16):</strong> Correct inaccurate data</li>
              <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your account</li>
              <li><strong>Right to Data Portability (Art. 20):</strong> Export your data in JSON format</li>
              <li><strong>Right to Object (Art. 21):</strong> Object to certain processing activities</li>
              <li><strong>Right to Restrict Processing (Art. 18):</strong> Limit how we use your data</li>
              <li><strong>Right to Withdraw Consent:</strong> Unsubscribe from marketing emails</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">How to Exercise Your Rights</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Export your data:</strong> Visit <code>/api/user/export</code> or contact us</li>
              <li><strong>Delete your account:</strong> Visit <code>/api/user/account</code> (DELETE) or contact us</li>
              <li><strong>Other requests:</strong> Email privacy@vybzzz.com</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We will respond to your request within 30 days.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Account data:</strong> Kept while your account is active</li>
              <li><strong>Financial records:</strong> Retained for 10 years (French legal requirement)</li>
              <li><strong>Marketing data:</strong> Kept until you unsubscribe</li>
              <li><strong>Logs:</strong> Kept for 90 days</li>
            </ul>
            <p className="text-gray-700 mt-4">
              When you delete your account, we anonymize your personal data while retaining
              financial records for legal compliance.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Security</h2>
            <p className="text-gray-700">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Encrypted database storage</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Rate limiting and DDoS protection</li>
              <li>Regular security audits</li>
              <li>Multi-factor authentication (optional)</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cookies</h2>
            <p className="text-gray-700">
              We use the following types of cookies:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li><strong>Essential cookies:</strong> Required for authentication and security</li>
              <li><strong>Performance cookies:</strong> Analytics to improve our services</li>
              <li><strong>Functional cookies:</strong> Remember your preferences</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can manage cookies in your browser settings. Note that disabling essential
              cookies may affect functionality.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700">
              Your data may be transferred to and stored in countries outside the European Economic Area (EEA).
              We ensure adequate protection through:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li>EU Standard Contractual Clauses (SCCs)</li>
              <li>Adequacy decisions by the European Commission</li>
              <li>GDPR-compliant service providers</li>
            </ul>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes via email or platform notification. Continued use of our services after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700">
              For privacy-related questions or requests, contact us at:
            </p>
            <address className="not-italic text-gray-700 mt-2">
              Email: privacy@vybzzz.com<br />
              DPO: dpo@vybzzz.com<br />
              Mail: VyBzzZ SAS, [Address], France
            </address>
            <p className="text-gray-700 mt-4">
              You also have the right to lodge a complaint with the French data protection authority (CNIL):
              <br />
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                www.cnil.fr
              </a>
            </p>
          </section>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
