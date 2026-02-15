import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Clock, Shield, CreditCard } from "lucide-react";

export default function RefundPolicy() {
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h2>
          <p className="text-gray-600">Last updated: January 5, 2025</p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Quick Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">30-Day Free Trial</h3>
                <p className="text-sm text-gray-600">Try all features risk-free</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">14-Day Guarantee</h3>
                <p className="text-sm text-gray-600">Full refund within 14 days</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Easy Process</h3>
                <p className="text-sm text-gray-600">Simple refund requests</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. 30-Day Free Trial</h3>
              <p className="text-gray-700 leading-relaxed">
                All new VibeStrat accounts include a 30-day free trial period. During this time, you have full access to all features 
                and capabilities of your chosen plan without any charges. No credit card is required to start your trial.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. 14-Day Money-Back Guarantee</h3>
              <p className="text-gray-700 leading-relaxed">
                If you're not completely satisfied with VibeStrat after your trial period, we offer a 14-day money-back guarantee 
                from your first paid billing cycle. You can request a full refund for any reason within this period.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Refund Eligibility</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p><strong>Eligible for Refund:</strong></p>
                <p>• First-time subscribers within 14 days of initial payment</p>
                <p>• Service downtime exceeding 48 consecutive hours due to our technical issues</p>
                <p>• Billing errors or duplicate charges</p>
                <p>• Unused portions of annual subscriptions (prorated)</p>
                
                <p className="mt-4"><strong>Not Eligible for Refund:</strong></p>
                <p>• Refund requests after 14 days of initial payment</p>
                <p>• Monthly subscriptions beyond the first billing cycle</p>
                <p>• Services used for illegal activities or policy violations</p>
                <p>• Accounts terminated for Terms of Service violations</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. How to Request a Refund</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>To request a refund, please contact our support team with the following information:</p>
                <p>• Email: support@vibestrat.com</p>
                <p>• Subject line: "Refund Request"</p>
                <p>• Your account email and organization name</p>
                <p>• Reason for refund request</p>
                <p>• Any relevant details or feedback</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Refund Processing</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>• Refund requests are typically processed within 2-3 business days</p>
                <p>• Approved refunds are credited to the original payment method</p>
                <p>• Credit card refunds may take 5-10 business days to appear on your statement</p>
                <p>• You will receive email confirmation once the refund is processed</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Cancellation vs. Refund</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p><strong>Cancellation:</strong> You can cancel your subscription at any time through your account settings. 
                Cancellation stops future billing but does not provide a refund for the current billing period.</p>
                
                <p><strong>Refund:</strong> A refund returns money already paid, subject to the eligibility requirements outlined above.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Prorated Refunds for Annual Plans</h3>
              <p className="text-gray-700 leading-relaxed">
                For annual subscription plans, if you cancel within the 14-day guarantee period, you will receive a full refund. 
                If you cancel after this period, you may be eligible for a prorated refund for the unused portion of your subscription.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Service Credits</h3>
              <p className="text-gray-700 leading-relaxed">
                In cases where a refund may not be appropriate, we may offer service credits to your account. 
                These credits can be applied to future billing cycles and do not expire.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Exceptional Circumstances</h3>
              <p className="text-gray-700 leading-relaxed">
                We understand that exceptional circumstances may arise. If you have a situation that doesn't fall under our 
                standard refund policy, please contact our support team. We review each case individually and may make exceptions 
                at our discretion.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h3>
              <p className="text-gray-700 leading-relaxed">
                We may update this refund policy from time to time. Any changes will be posted on this page with an updated 
                "Last updated" date. We will notify active subscribers of significant changes via email.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h3>
              <div className="text-gray-700 leading-relaxed">
                <p>If you have questions about our refund policy or need assistance, please contact us:</p>
                <p className="mt-2">
                  <strong>Email:</strong> support@vibestrat.com<br />
                  <strong>Phone:</strong> 1-800-VIBESTRAT<br />
                  <strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM PST
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}