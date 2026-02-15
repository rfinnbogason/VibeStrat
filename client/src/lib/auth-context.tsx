import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { pushNotificationService } from "./push-notifications";

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profileImageUrl?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword?: boolean }>;
  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => Promise<{ token: string; user: AuthUser }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // On mount, validate stored token
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then(async (res) => {
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setToken(storedToken);
            try {
              await pushNotificationService.initialize();
            } catch (e) {
              // push notifications optional
            }
          } else {
            localStorage.removeItem("auth_token");
          }
        })
        .catch(() => {
          localStorage.removeItem("auth_token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    if (data.mustChangePassword) {
      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return { mustChangePassword: true };
    }

    localStorage.setItem("auth_token", data.token);
    setToken(data.token);
    setUser(data.user);

    try {
      await pushNotificationService.initialize();
    } catch (e) {
      // push notifications optional
    }

    return {};
  }, []);

  const signup = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw result;
      }

      localStorage.setItem("auth_token", result.token);
      setToken(result.token);
      setUser(result.user);

      return result;
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    try {
      await pushNotificationService.clearToken();
    } catch (e) {
      // ignore
    }
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  }, [toast]);

  const value = {
    user,
    token,
    isLoading: loading,
    isAuthenticated: !!user && !!token,
    login,
    signup,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

// Protected route wrapper
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return <>{children}</>;
}
