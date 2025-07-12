import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4 flex justify-between items-center">
          {/* App Name Text instead of missing logo */}
          <h1 className="text-xl font-bold text-gray-800">VibeStrat</h1>
          <div className="flex gap-2 lg:gap-3">
            <Button onClick={handleUserLogin} variant="outline" size="sm" className="text-sm lg:text-base">
              Sign In
            </Button>
            <Button onClick={handleSignUp} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm lg:text-base">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 lg:px-6 py-12 lg:py-20 text-center">
        <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
          🚀 AI-Powered Platform
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Transform Your Strata
          </span>
          <br />
          <span className="text-gray-900">Management Experience</span>
        </h1>
        <p className="text-lg lg:text-xl text-gray-600 mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed">
          The complete platform for modern strata management. AI-powered document processing, real-time communications, automated workflows, and professional reporting - all in one place.
        </p>
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center mb-8 lg:mb-12">
          <Button size="lg" onClick={handleSignUp} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" onClick={handleUserLogin} variant="outline" className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-200">
            Sign In
          </Button>
        </div>
        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Bank-level security</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>30-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-purple-500" />
            <span>Expert support</span>
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
          {[
            { icon: Bot, title: "AI Document Processing", desc: "Upload quotes, invoices, and contracts - AI automatically extracts and organizes all data" },
            { icon: DollarSign, title: "Complete Financial Suite", desc: "Budgets, expenses, fee tracking, reserve funds, and automated payment reminders" },
            { icon: MessageSquare, title: "Smart Communications", desc: "Messenger-style chat, announcements, notifications, and resident directory" },
            { icon: Calendar, title: "Meeting Management", desc: "Scheduling, invitations, agenda management, and AI-powered transcription" },
            { icon: Smartphone, title: "Mobile-First Design", desc: "Perfect experience on any device - manage your strata from anywhere" },
            { icon: BarChart3, title: "Professional Reports", desc: "Financial reports, meeting packages, and home sale documentation" }
          ].map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl w-fit">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600">{feature.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
