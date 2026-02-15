import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard, Calendar, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import logoPath from "@assets/logo.png";

export default function TrialExpiredPage() {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation("/billing");
  };

  const handleSignOut = () => {
    // Sign out user
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <img
              src={logoPath}
              alt="VibeStrat"
              className="h-16 w-auto"
            />
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="shadow-2xl border-orange-200">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-3xl">Your Trial Has Ended</CardTitle>
              <CardDescription className="text-base">
                Your 30-day free trial has expired. Upgrade now to continue managing your strata with all premium features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features Included */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-green-900">
                  Continue with Premium Features
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Unlimited Properties</p>
                      <p className="text-sm text-muted-foreground">Manage multiple stratas from one account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Advanced Financial Tools</p>
                      <p className="text-sm text-muted-foreground">Track expenses, budgets, and financial reporting</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Document Management</p>
                      <p className="text-sm text-muted-foreground">Store bylaws, minutes, and important files securely</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Communication Tools</p>
                      <p className="text-sm text-muted-foreground">Announcements, messaging, and notifications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Priority Support</p>
                      <p className="text-sm text-muted-foreground">Get help when you need it from our team</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center py-4">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Cancel anytime. No long-term contracts.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Upgrade to Premium
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Sign Out
                </Button>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground">
                  Questions about billing?{" "}
                  <a href="mailto:support@vibestrat.com" className="text-green-600 hover:text-green-700 font-medium">
                    Contact our support team
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
