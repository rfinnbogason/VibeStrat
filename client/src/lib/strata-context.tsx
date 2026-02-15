import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import type { Strata } from "@shared/schema";

interface StrataContextType {
  selectedStrataId: string | null;
  selectedStrata: Strata | null;
  availableStrata: Strata[];
  isLoading: boolean;
  setSelectedStrata: (strataId: string) => void;
}

const StrataContext = createContext<StrataContextType | undefined>(undefined);

export function StrataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStrataId, setSelectedStrataId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // For master admin, fetch all strata; for regular users, fetch only assigned strata
  const isMasterAdmin = user?.email === 'rfinnbogason@gmail.com';
  const { data: availableStrata = [], isLoading, error } = useQuery<Strata[]>({
    queryKey: isMasterAdmin ? ["/api/admin/strata"] : ["/api/strata"],
    enabled: !!user,
  });

  // ✅ SECURITY: Removed debug logging that exposed sensitive user data

  // Show onboarding wizard if user has no stratas
  // TEMPORARILY DISABLED: Wizard is causing issues on Android
  // Will re-enable once mobile localStorage is working properly
  useEffect(() => {
    // DISABLED: Always hide the onboarding wizard
    setShowOnboarding(false);

    // Old logic (commented out for now):
    // const signupComplete = localStorage.getItem('signupComplete');
    // const hasSelectedStrata = localStorage.getItem('selectedStrata');
    // if (user && !isLoading && availableStrata.length === 0 && !hasSelectedStrata) {
    //   setShowOnboarding(true);
    // }
  }, [isLoading, user, availableStrata.length]);

  // Initialize selected strata from localStorage or first available
  useEffect(() => {
    // Don't do anything if still loading or no stratas available
    if (isLoading || availableStrata.length === 0) {
      return;
    }

    // If we already have a valid selected strata, don't change it
    if (selectedStrataId && availableStrata.some(s => s.id === selectedStrataId)) {
      return;
    }

    // Try to restore from localStorage first
    const storedStrataId = localStorage.getItem('selectedStrata');
    if (storedStrataId && availableStrata.some(s => s.id === storedStrataId)) {
      // ✅ SECURITY: Removed console logging
      setSelectedStrataId(storedStrataId);
      return;
    }

    // Auto-select first available strata
    const firstStrata = availableStrata[0];
    // ✅ SECURITY: Removed console logging
    setSelectedStrataId(firstStrata.id);
    localStorage.setItem('selectedStrata', firstStrata.id);
    localStorage.setItem('currentStrata', JSON.stringify(firstStrata));
  }, [availableStrata, isLoading, selectedStrataId]);

  const handleSetSelectedStrata = (strataId: string) => {
    setSelectedStrataId(strataId);
    localStorage.setItem('selectedStrata', strataId);
    
    const selectedStrataData = availableStrata.find(s => s.id === strataId);
    if (selectedStrataData) {
      localStorage.setItem('currentStrata', JSON.stringify(selectedStrataData));
    }
    
    // Emit event for components that need to react to changes
    window.dispatchEvent(new CustomEvent('strataChanged', {
      detail: { strataId }
    }));
  };

  const handleOnboardingComplete = () => {
    // Refetch stratas to get the newly created one
    const queryKey = isMasterAdmin ? ["/api/admin/strata"] : ["/api/strata"];
    queryClient.invalidateQueries({ queryKey });
    setShowOnboarding(false);
  };

  const selectedStrata = selectedStrataId
    ? availableStrata.find(s => s.id === selectedStrataId) || null
    : null;

  const value = {
    selectedStrataId,
    selectedStrata,
    availableStrata,
    isLoading,
    setSelectedStrata: handleSetSelectedStrata,
  };

  return (
    <StrataContext.Provider value={value}>
      {children}
      {/* TEMPORARILY REMOVED: Onboarding wizard disabled due to Android issues */}
      {/* <OnboardingWizard
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      /> */}
    </StrataContext.Provider>
  );
}

export function useStrata() {
  const context = useContext(StrataContext);
  if (context === undefined) {
    throw new Error('useStrata must be used within a StrataProvider');
  }
  return context;
}