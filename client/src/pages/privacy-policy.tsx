import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Shield, Eye, Lock, Database, Users } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VibeStrat
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h2>
          <p className="text-gray-600">Last updated: January 5, 2025</p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Privacy Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Bank-Level Security</h3>
                <p className="text-sm text-gray-600">Enterprise-grade encryption</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Data Transparency</h3>
                <p className="text-sm text-gray-600">Clear data usage policies</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Lock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Your Control</h3>
                <p className="text-sm text-gray-600">Full data ownership rights</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Personal Information:</h4>
                  <div className="text-gray-700 leading-relaxed space-y-1">
                    <p>• Name, email address, phone number</p>
                    <p>• Billing address and payment information</p>
                    <p>• Job title and organization details</p>
                    <p>• Profile information and preferences</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Strata Management Data:</h4>
                  <div className="text-gray-700 leading-relaxed space-y-1">
                    <p>• Property and unit information</p>
                    <p>• Financial records and transactions</p>
                    <p>• Vendor and contractor details</p>
                    <p>• Meeting minutes and documents</p>
                    <p>• Communications and messages</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Technical Information:</h4>
                  <div className="text-gray-700 leading-relaxed space-y-1">
                    <p>• IP address and device information</p>
                    <p>• Browser type and operating system</p>
                    <p>• Usage patterns and feature interactions</p>
                    <p>• Log files and error reports</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p><strong>Service Delivery:</strong></p>
                <p>• Provide and maintain VibeStrat platform functionality</p>
                <p>• Process payments and manage subscriptions</p>
                <p>• Facilitate communication between strata members</p>
                <p>• Generate reports and analytics</p>

                <p className="mt-4"><strong>Platform Improvement:</strong></p>
                <p>• Analyze usage patterns to enhance features</p>
                <p>• Troubleshoot technical issues</p>
                <p>• Develop new capabilities and improvements</p>

                <p className="mt-4"><strong>Communication:</strong></p>
                <p>• Send important service updates and notifications</p>
                <p>• Provide customer support</p>
                <p>• Share relevant product updates (with your consent)</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. AI and Data Processing</h3>
              <p className="text-gray-700 leading-relaxed">
                VibeStrat uses AI technology to process documents, transcribe meetings, and extract information from uploaded files. 
                This processing occurs in secure environments, and AI-processed data is subject to the same privacy protections 
                as all other platform data. We do not use your data to train AI models or share it with AI service providers 
                beyond the scope of providing our services.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing and Disclosure</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p><strong>We DO NOT sell your personal information.</strong></p>
                
                <p className="mt-4"><strong>Limited Sharing Occurs Only:</strong></p>
                <p>• With your explicit consent</p>
                <p>• To comply with legal requirements</p>
                <p>• With trusted service providers under strict confidentiality agreements</p>
                <p>• To protect our rights, property, or safety</p>
                <p>• In connection with business transfers (with notice to you)</p>

                <p className="mt-4"><strong>Service Providers:</strong></p>
                <p>• Payment processing (Stripe)</p>
                <p>• Cloud hosting services (secure, encrypted)</p>
                <p>• AI processing services (OpenAI, with data protection agreements)</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>We implement industry-standard security measures:</p>
                <p>• End-to-end encryption for data transmission</p>
                <p>• Encrypted storage of all sensitive information</p>
                <p>• Regular security audits and vulnerability assessments</p>
                <p>• Access controls and authentication requirements</p>
                <p>• Employee training on data protection practices</p>
                <p>• Incident response procedures</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>• Account data: Retained while your account is active</p>
                <p>• Financial records: Retained for 7 years for legal compliance</p>
                <p>• Communication logs: Retained for 3 years</p>
                <p>• Technical logs: Retained for 1 year</p>
                <p>• Deleted account data: Permanently removed within 30 days</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Your Privacy Rights</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>You have the right to:</p>
                <p>• Access your personal information</p>
                <p>• Correct inaccurate or incomplete data</p>
                <p>• Delete your account and associated data</p>
                <p>• Export your data in a portable format</p>
                <p>• Opt-out of marketing communications</p>
                <p>• Restrict processing of your information</p>
                <p>• File complaints with data protection authorities</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies and Tracking</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>We use cookies and similar technologies for:</p>
                <p>• Authentication and session management</p>
                <p>• Remembering your preferences</p>
                <p>• Analytics to improve our service</p>
                <p>• Security and fraud prevention</p>
                
                <p className="mt-4">You can control cookie settings through your browser preferences.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">9. International Data Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                VibeStrat is hosted in Canada. If you access our services from outside Canada, your information may be 
                transferred to and processed in Canada. We ensure appropriate safeguards are in place for international transfers.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h3>
              <p className="text-gray-700 leading-relaxed">
                VibeStrat is not intended for use by individuals under 18 years of age. We do not knowingly collect 
                personal information from children under 18.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h3>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy periodically. We will notify you of material changes via email or 
                through our platform. Your continued use of VibeStrat after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h3>
              <div className="text-gray-700 leading-relaxed">
                <p>For questions about this privacy policy or your data:</p>
                <p className="mt-2">
                  <strong>Privacy Officer:</strong> privacy@vibestrat.com<br />
                  <strong>General Support:</strong> support@vibestrat.com<br />
                  <strong>Mailing Address:</strong><br />
                  VibeStrat Privacy Team<br />
                  123 Main Street<br />
                  Vancouver, BC V6B 1A1<br />
                  Canada
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}