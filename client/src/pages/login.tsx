import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import logoPath from "@assets/logo.png";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [showMigrationInfo, setShowMigrationInfo] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user as any);
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user needs to change password and get user data
      try {
        const token = await userCredential.user.getIdToken();
        const response = await fetch('/api/user/must-change-password', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.mustChangePassword) {
            // Redirect to password change page
            setLocation("/change-password");
            return;
          }
        }

        // Get user data for welcome message
        const userResponse = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        let firstName = '';
        if (userResponse.ok) {
          const userData = await userResponse.json();
          firstName = userData.firstName || '';
        }

        toast({
          title: "Welcome back!",
          description: firstName ? `Welcome back, ${firstName}!` : "Welcome back!",
        });

        // Redirect to dashboard
        setLocation("/");
      } catch (checkError) {
        console.log("Error checking password change requirement:", checkError);
        // Continue with normal login if check fails
        toast({
          title: "Welcome back!",
          description: "Welcome back!",
        });

        // Redirect to dashboard
        setLocation("/");
      }
      console.log("Firebase User:", userCredential.user);
    } catch (error: any) {
      console.log("Firebase error:", error.code, error.message);
      
      // Handle different Firebase error scenarios
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        // Check if this user exists in PostgreSQL for migration (exclude Firebase-native accounts)
        try {
          const checkResponse = await apiRequest("POST", "/api/migration/check-user", { email });
          const userData = await checkResponse.json();
          
          // Only show migration path for accounts that don't already exist in Firebase
          if (userData.exists && userData.needsMigration) {
            if (password === userData.temporaryPassword) {
              try {
                // Create Firebase account for existing PostgreSQL user
                console.log("Creating Firebase account for:", email, "with password:", userData.temporaryPassword);
                const newUserCredential = await createUserWithEmailAndPassword(auth, email, userData.temporaryPassword);
                
                toast({
                  title: "Account Migrated!",
                  description: `Welcome ${userData.user.firstName}! Your account has been migrated to Firebase.`,
                });
                console.log("Migrated User:", newUserCredential.user, "Original Data:", userData.user);
              } catch (createError: any) {
                console.log("Firebase creation error:", createError.code, createError.message);
                toast({
                  title: "Migration Failed",
                  description: `Error: ${createError.message}`,
                  variant: "destructive",
                });
              }
            } else {
              // Show temp password only for PostgreSQL users that need migration
              console.log("Password mismatch for migration user. Entered:", password, "Expected:", userData.temporaryPassword);
              toast({
                title: "Account Found",
                description: `Your account needs migration. Use the temporary password: ${userData.temporaryPassword}`,
                variant: "destructive",
              });
              setPassword(userData.temporaryPassword);
            }
          } else {
            // This is likely a Firebase-native user with wrong credentials
            toast({
              title: "Sign In Failed",
              description: "Invalid email or password. Please check your credentials and try again.",
              variant: "destructive",
            });
          }
        } catch (checkError) {
          // Network error or other issue - show generic error
          toast({
            title: "Sign In Failed",
            description: "Invalid email or password. Please check your credentials.",
            variant: "destructive",
          });
        }
      } else if (error.code === 'auth/user-not-found') {
        toast({
          title: "Account Not Found",
          description: "No account found with this email. Please create a new account.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: error.message || "Authentication failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Account Created!",
        description: "Welcome to VibeStrat Firebase! Your account has been created.",
      });
      console.log("New Firebase User:", userCredential.user);
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  // If user is already authenticated, show user info
  if (authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src={logoPath}
                alt="Logo"
                className="h-24 w-auto object-contain"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Authentication Successful
            </p>
          </div>
          
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-green-600">✅ Authenticated!</CardTitle>
              <CardDescription>Firebase authentication is working</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Email: {authUser.email}
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  User ID: {authUser.uid}
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Created: {authUser.metadata?.creationTime ? new Date(authUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSignOut} variant="outline" className="flex-1">
                  Sign Out
                </Button>
                <Button onClick={() => setLocation("/")} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to App
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={logoPath}
              alt="Logo"
              className="h-40 w-auto object-contain"
            />
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle>Secure Login</CardTitle>
            <CardDescription>
              Access your account securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full text-white hover:text-white" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>

                  <div className="text-center">
                    <Link href="/forgot-password">
                      <a className="text-sm text-primary hover:underline">
                        Forgot your password?
                      </a>
                    </Link>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>



        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 VibeStrat. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}