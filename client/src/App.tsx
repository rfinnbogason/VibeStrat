import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/lib/auth-context";
import { StrataProvider } from "@/lib/strata-context";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ChangePassword from "@/pages/change-password";
import ForgotPassword from "@/pages/forgot-password";
import Dashboard from "@/pages/dashboard";
import Financial from "@/pages/financial";
import Quotes from "@/pages/quotes";
import Vendors from "@/pages/vendors";
import Dwellings from "@/pages/dwellings";
import Documents from "@/pages/documents";
import Meetings from "@/pages/meetings";
import Maintenance from "@/pages/maintenance";
import RepairRequests from "@/pages/repair-requests";
import Communications from "@/pages/communications";
import Reports from "@/pages/reports";
import Admin from "@/pages/admin";
import StrataAdmin from "@/pages/strata-admin";
import Billing from "@/pages/billing";
import Terms from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy-policy";
import RefundPolicy from "@/pages/refund-policy";
import TrialExpired from "@/pages/trial-expired";
import MainLayout from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";
import Footer from "@/components/Footer";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Switch>
          {!isAuthenticated ? (
            <>
              <Route path="/" component={Landing} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/change-password" component={ChangePassword} />
              <Route path="/forgot-password" component={ForgotPassword} />
              <Route path="/trial-expired" component={TrialExpired} />
              <Route path="/terms" component={Terms} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
              <Route path="/refund-policy" component={RefundPolicy} />
            </>
          ) : (
            <StrataProvider>
              <MainLayout>
                <Route path="/" component={Dashboard} />
                <Route path="/financial" component={Financial} />
                <Route path="/quotes" component={Quotes} />
                <Route path="/vendors" component={Vendors} />
                <Route path="/dwellings" component={Dwellings} />
                <Route path="/documents" component={Documents} />
                <Route path="/meetings" component={Meetings} />
                <Route path="/maintenance" component={Maintenance} />
                <Route path="/repair-requests" component={RepairRequests} />
                <Route path="/communications" component={Communications} />
                <Route path="/reports" component={Reports} />
                <Route path="/billing" component={Billing} />
                <Route path="/admin" component={Admin} />
                <Route path="/strata-admin" component={StrataAdmin} />
                <Route path="/terms" component={Terms} />
                <Route path="/privacy-policy" component={PrivacyPolicy} />
                <Route path="/refund-policy" component={RefundPolicy} />
              </MainLayout>
            </StrataProvider>
          )}
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
