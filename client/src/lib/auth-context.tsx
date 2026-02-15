import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useToast } from "@/hooks/use-toast";
import { pushNotificationService } from "./push-notifications";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // Get Firebase ID token when user is authenticated
      if (user) {
        try {
          const idToken = await user.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error('❌ Failed to get ID token:', error);
          setToken(null);
        }
      } else {
        setToken(null);
      }

      setLoading(false);

      // Initialize push notifications when user logs in
      if (user) {
        // ✅ SECURITY: Removed console logging
        try {
          await pushNotificationService.initialize();
        } catch (error) {
          console.error('❌ Failed to initialize push notifications:', error);
        }
      } else {
        // Clear FCM token when user logs out
        // ✅ SECURITY: Removed console logging
        try {
          await pushNotificationService.clearToken();
        } catch (error) {
          console.error('❌ Failed to clear push notification token:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    token,
    isLoading: loading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within an AuthProvider");
  }
  return context;
}

// Protected route wrapper
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useFirebaseAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page
    window.location.href = "/login";
    return null;
  }

  return <>{children}</>;
}