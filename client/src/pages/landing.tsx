import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoPath from "@assets/logo.png";
import { 
  DollarSign, 
  FileText, 
  Users, 
  Calendar, 
  Wrench, 
  MessageSquare, 
  ClipboardList, 
  Shield, 
  Smartphone, 
  Clock,
  BarChart3,
  Bot,
  Mail,
  Check,
  Star,
  ArrowRight,
  Zap,
  Globe,
  Headphones
} from "lucide-react";

export default function Landing() {
  const handleUserLogin = () => {
    window.location.href = "/login";
  };

  const handleSignUp = () => {
    window.location.href = "/signup";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                src={logoPath}
                alt="VibeStrat"
                className="h-16 lg:h-20 w-auto mt-[-12px] mb-[-12px] pt-[0px] pb-[0px] pl-[10px] pr-[10px] ml-[0px] mr-[0px]"
              />
            </div>
            <div className="flex gap-2 lg:gap-3">
              <Button onClick={handleUserLogin} variant="outline" size="sm" className="text-sm lg:text-base">
                Sign In
              </Button>
              <Button onClick={handleSignUp} size="sm" className="bg-green-600 hover:bg-green-700 text-sm lg:text-base">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="container mx-auto px-4 lg:px-6 py-12 lg:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent">
              Transform Your Strata
            </span>
            <br />
            <span className="text-gray-900">Management Experience</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed">
            The complete platform for modern strata management. AI-powered document processing, 
            real-time communications, automated workflows, and professional reporting - all in one place.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center mb-8 lg:mb-12">
            <Button
              size="lg"
              onClick={handleSignUp}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              onClick={handleUserLogin} 
              variant="outline" 
              className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-200"
            >
              Sign In
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-purple-500" />
              <span>Expert support</span>
            </div>
          </div>
        </div>
      </section>
      {/* Key Features Highlight */}
      <section className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Property Managers Choose VibeStrat
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to run a professional strata operation, designed by experts who understand your challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Features */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl w-fit">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">AI Document Processing</CardTitle>
              <CardDescription className="text-gray-600">
                Upload quotes, invoices, and contracts - AI automatically extracts and organizes all data
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Financial Management */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl w-fit">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Complete Financial Suite</CardTitle>
              <CardDescription className="text-gray-600">
                Budgets, expenses, fee tracking, reserve funds, and automated payment reminders
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Communications */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl w-fit">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Smart Communications</CardTitle>
              <CardDescription className="text-gray-600">
                Messenger-style chat, announcements, notifications, and resident directory
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Meeting Management */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl w-fit">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Meeting Management</CardTitle>
              <CardDescription className="text-gray-600">
                Scheduling, invitations, agenda management, and AI-powered transcription
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Mobile Optimized */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl w-fit">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Mobile-First Design</CardTitle>
              <CardDescription className="text-gray-600">
                Perfect experience on any device - manage your strata from anywhere
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Professional Reports */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-teal-50 to-green-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-teal-600 to-green-600 rounded-2xl w-fit">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Professional Reports</CardTitle>
              <CardDescription className="text-gray-600">
                Financial reports, meeting packages, and home sale documentation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      {/* Comprehensive Features Grid */}
      <section className="bg-white py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Complete Strata Management Solution
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every feature you need to run a professional operation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: "Quote Management", desc: "Request, compare, and approve vendor quotes" },
              { icon: Users, title: "Vendor Directory", desc: "Maintain trusted contractor database" },
              { icon: Wrench, title: "Maintenance Tracking", desc: "Log and track all maintenance requests" },
              { icon: ClipboardList, title: "Unit Management", desc: "Complete dwelling and owner information" },
              { icon: Mail, title: "Payment Reminders", desc: "Automated recurring payment notifications" },
              { icon: Globe, title: "Multi-Strata Support", desc: "Manage multiple properties efficiently" },
              { icon: Shield, title: "Role-Based Access", desc: "Secure permissions for all users" },
              { icon: Zap, title: "Real-Time Updates", desc: "Instant notifications and live data" }
            ].map((feature, index) => (
              <div key={index} className="text-center p-4">
                <div className="mx-auto mb-3 p-2 bg-gray-100 rounded-xl w-fit">
                  <feature.icon className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your strata size. All plans include full features and support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Standard Plan */}
          <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Standard</CardTitle>
              <CardDescription className="text-gray-600 mb-4">Perfect for smaller strata communities</CardDescription>
              <div className="text-3xl font-bold text-gray-900">
                $49<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-500">Up to 100 units</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3 mb-6">
                {[
                  "Complete financial management",
                  "AI document processing",
                  "Smart communications",
                  "Meeting management",
                  "Professional reports",
                  "Mobile optimization",
                  "Email support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleSignUp} className="w-full bg-green-600 hover:bg-green-700">
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-gray-50">
            <CardHeader className="text-center pb-4">
              <Badge className="mb-3 bg-green-600 text-white border-none">
                Most Popular
              </Badge>
              <CardTitle className="text-xl font-bold text-gray-900">Premium</CardTitle>
              <CardDescription className="text-gray-600 mb-4">For larger strata communities</CardDescription>
              <div className="text-3xl font-bold text-gray-900">
                $79<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-500">100+ units</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3 mb-6">
                {[
                  "Everything in Standard",
                  "Unlimited units",
                  "Priority support",
                  "Advanced reporting",
                  "Custom integrations",
                  "Dedicated account manager",
                  "Phone support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleSignUp} className="w-full bg-green-600 hover:bg-green-700">
                Start Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            30-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </section>
      {/* Final CTA */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6">
            Ready to Transform Your Strata Management?
          </h2>
          <p className="text-lg lg:text-xl mb-8 lg:mb-10 opacity-90 max-w-2xl mx-auto">
            Join property managers who have streamlined their operations with VibeStrat's comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleSignUp}
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              onClick={handleUserLogin}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg font-semibold transition-all duration-200"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}