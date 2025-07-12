import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
  const [selectedStrataId, setSelectedStrataId] = useState<string | null>(null);

  // For master admin, fetch all strata; for regular users, fetch only assigned strata
  const isMasterAdmin = user?.email === 'rfinnbogason@gmail.com';
  const { data: availableStrata = [], isLoading } = useQuery<Strata[]>({
    queryKey: isMasterAdmin ? ["/api/admin/strata"] : ["/api/strata"],
    enabled: !!user,
  });

  // Initialize selected strata from localStorage or first available
  useEffect(() => {
    const storedStrataId = localStorage.getItem('selectedStrata');
    if (storedStrataId && availableStrata.some(s => s.id === storedStrataId)) {
      setSelectedStrataId(storedStrataId);
    } else if (availableStrata.length > 0 && !selectedStrataId) {
      const firstStrata = availableStrata[0];
      setSelectedStrataId(firstStrata.id);
      localStorage.setItem('selectedStrata', firstStrata.id);
      localStorage.setItem('currentStrata', JSON.stringify(firstStrata));
    }
  }, [availableStrata, selectedStrataId]);

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