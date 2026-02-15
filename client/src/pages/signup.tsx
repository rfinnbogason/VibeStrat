import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/logo.png";

const signupSchema = z.object({
  adminFirstName: z.string().min(2, "First name must be at least 2 characters"),
  adminLastName: z.string().min(2, "Last name must be at least 2 characters"),
  adminEmail: z.string().email("Please enter a valid email address"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  adminPasswordConfirm: z.string().min(6, "Password must be at least 6 characters"),
  adminPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  strataName: z.string().min(2, "Strata name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  province: z.string().min(2, "Province must be at least 2 characters"),
  postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  unitCount: z.number().min(1, "Unit count must be at least 1"),
  managementType: z.enum(["self_managed", "professional_managed"]),
  managementCompany: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
}).refine((data) => data.adminPassword === data.adminPasswordConfirm, {
  message: "Passwords don't match",
  path: ["adminPasswordConfirm"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { signup } = useAuth();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      strataName: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      unitCount: 0,
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPassword: "",
      adminPasswordConfirm: "",
      adminPhone: "",
      managementType: "self_managed",
      managementCompany: "",
      description: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);

    try {
      // Step 1: Create account via JWT auth
      const result = await signup({
        email: data.adminEmail,
        password: data.adminPassword,
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
        phoneNumber: data.adminPhone,
      });

      // Step 2: Create the strata (token is now in localStorage)
      const strataResponse = await apiRequest("POST", "/api/strata", {
        name: data.strataName,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        country: "Canada",
        unitCount: data.unitCount,
        managementCompany: data.managementType === "professional_managed" ? data.managementCompany : undefined,
        notes: data.description,
        status: "active",
      });

      if (!strataResponse.ok) {
        toast({
          title: "Account Created!",
          description: "Your account was created successfully. Please complete your property setup.",
          variant: "default",
        });
        setTimeout(() => setLocation("/"), 1000);
        return;
      }

      const strataData = await strataResponse.json();

      localStorage.setItem('selectedStrata', strataData.id);
      localStorage.setItem('signupComplete', 'true');
      localStorage.setItem('needsPaymentSetup', 'true');

      toast({
        title: "Welcome to VibeStrat!",
        description: "Your account has been created! Let's set up your payment method to start your 30-day trial.",
      });

      setTimeout(() => setLocation("/billing"), 1000);
    } catch (error: any) {
      let errorMessage = "Failed to create account. Please try again.";

      if (error.message?.includes("already exists")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={logoPath} alt="VibeStrat" className="h-16 lg:h-20 w-auto" />
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent mb-4">
              Start Your Free Trial
            </h1>
            <p className="text-lg text-muted-foreground">
              Create your account and set up your strata in minutes. No credit card required.
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Create Your Account</CardTitle>
              <CardDescription>
                Set up your strata management account with a 30-day free trial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="adminFirstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="adminLastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Smith" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="adminEmail" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="john.smith@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="adminPassword" render={({ field }) => (
                        <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="At least 6 characters" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="adminPasswordConfirm" render={({ field }) => (
                        <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="Re-enter password" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="adminPhone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(604) 555-0123" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Information</h3>
                    <FormField control={form.control} name="strataName" render={({ field }) => (
                      <FormItem><FormLabel>Strata Name</FormLabel><FormControl><Input placeholder="e.g., Sunset Gardens Strata" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="e.g., 123 Main Street" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Vancouver" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="province" render={({ field }) => (
                        <FormItem><FormLabel>Province</FormLabel><FormControl><Input placeholder="BC" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="postalCode" render={({ field }) => (
                        <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="V6B 1A1" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="unitCount" render={({ field }) => (
                      <FormItem><FormLabel>Number of Units</FormLabel><FormControl><Input type="number" placeholder="50" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Management Details</h3>
                    <FormField control={form.control} name="managementType" render={({ field }) => (
                      <FormItem><FormLabel>Management Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select management type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="self_managed">Self-Managed</SelectItem>
                            <SelectItem value="professional_managed">Professionally Managed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {form.watch("managementType") === "professional_managed" && (
                      <FormField control={form.control} name="managementCompany" render={({ field }) => (
                        <FormItem><FormLabel>Management Company</FormLabel><FormControl><Input placeholder="ABC Property Management" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    )}
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Property Description</FormLabel><FormControl>
                        <Textarea placeholder="Brief description of your strata community, building type, amenities, etc." className="min-h-[100px]" {...field} />
                      </FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="pt-6">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg" disabled={isSubmitting}>
                      {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating Your Account...</>) : "Start Free Trial"}
                    </Button>
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <CheckCircle className="inline h-4 w-4 mr-1" />
                        <strong>30-day free trial</strong> - No credit card required - Cancel anytime
                      </p>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">Sign in here</Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
