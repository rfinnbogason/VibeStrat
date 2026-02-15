import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, CreditCard } from "lucide-react";
import { useStrata } from "@/lib/strata-context";
import { useLocation } from "wouter";

export function TrialWarningBanner() {
  const { selectedStrata } = useStrata();
  const [, setLocation] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissal when strata changes
  useEffect(() => {
    setIsDismissed(false);
  }, [selectedStrata?.id]);

  if (!selectedStrata?.subscription || isDismissed) {
    return null;
  }

  const subscription = selectedStrata.subscription;

  // Only show for trial status
  if (subscription.status !== 'trial') {
    return null;
  }

  // Free forever - no warning needed
  if (subscription.isFreeForever) {
    return null;
  }

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!subscription.trialEndDate) return 0;
    const endDate = (subscription.trialEndDate as any).toDate
      ? (subscription.trialEndDate as any).toDate()
      : new Date(subscription.trialEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();

  // Only show warning when 7 days or less remaining
  if (daysRemaining > 7) {
    return null;
  }

  const handleUpgrade = () => {
    setLocation("/billing");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Determine severity
  const isUrgent = daysRemaining <= 3;
  const bgColor = isUrgent ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200";
  const textColor = isUrgent ? "text-red-900" : "text-orange-900";
  const iconColor = isUrgent ? "text-red-600" : "text-orange-600";

  return (
    <Alert className={`${bgColor} border-l-4 ${isUrgent ? 'border-l-red-600' : 'border-l-orange-600'} relative`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <AlertTitle className={`${textColor} font-semibold text-base mb-1`}>
              {isUrgent
                ? `⏰ Trial Ending Soon - Only ${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'} Left!`
                : `Your Trial is Ending in ${daysRemaining} Days`
              }
            </AlertTitle>
            <AlertDescription className={`${textColor} text-sm`}>
              {isUrgent ? (
                <>
                  Your free trial expires in <strong>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>.
                  Upgrade now to avoid losing access to your property management tools.
                </>
              ) : (
                <>
                  Your 30-day free trial ends in {daysRemaining} days.
                  Upgrade to Premium to continue managing your property without interruption.
                </>
              )}
            </AlertDescription>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleUpgrade}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}
