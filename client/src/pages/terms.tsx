import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function Terms() {
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h2>
          <p className="text-gray-600">Last updated: January 5, 2025</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using VibeStrat ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h3>
              <p className="text-gray-700 leading-relaxed">
                VibeStrat is a comprehensive strata management platform that provides financial tracking, communication tools, 
                meeting management, vendor directory, quote management, and reporting capabilities for strata communities and property managers.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts and Registration</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>• You must provide accurate and complete registration information</p>
                <p>• You are responsible for maintaining the confidentiality of your account credentials</p>
                <p>• You must notify us immediately of any unauthorized use of your account</p>
                <p>• You must be at least 18 years old to use this service</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Subscription Plans and Billing</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>• Standard Plan: $49/month for strata communities with up to 100 units</p>
                <p>• Premium Plan: $79/month for strata communities with 100+ units</p>
                <p>• All plans include a 30-day free trial period</p>
                <p>• Billing occurs monthly in advance</p>
                <p>• Prices are subject to change with 30 days notice</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Acceptable Use Policy</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>You agree not to:</p>
                <p>• Use the service for any unlawful purposes</p>
                <p>• Upload malicious code, viruses, or harmful content</p>
                <p>• Attempt to gain unauthorized access to our systems</p>
                <p>• Share your account credentials with unauthorized users</p>
                <p>• Use the service to harass, abuse, or harm others</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Data Protection and Privacy</h3>
              <p className="text-gray-700 leading-relaxed">
                We are committed to protecting your privacy and personal data. Please refer to our Privacy Policy for detailed 
                information about how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h3>
              <p className="text-gray-700 leading-relaxed">
                All content, features, and functionality of VibeStrat are owned by us and are protected by copyright, trademark, 
                and other intellectual property laws. You retain ownership of data you upload to the platform.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Service Availability</h3>
              <p className="text-gray-700 leading-relaxed">
                While we strive for 99.9% uptime, we do not guarantee uninterrupted service availability. 
                We may perform maintenance that temporarily affects service availability, with advance notice when possible.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, VibeStrat shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                Either party may terminate this agreement at any time. Upon termination, your access to the service will cease, 
                and you may request data export within 30 days of termination.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email 
                or through the platform. Continued use constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Information</h3>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms and Conditions, please contact us at:
                <br />
                Email: legal@vibestrat.com
                <br />
                Address: 123 Main Street, Vancouver, BC, Canada V6B 1A1
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}