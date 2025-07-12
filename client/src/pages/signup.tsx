import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const strataRegistrationSchema = z.object({
  // Strata Information
  strataName: z.string().min(2, "Strata name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  province: z.string().min(2, "Province must be at least 2 characters"),
  postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  unitCount: z.number().min(1, "Unit count must be at least 1"),
  
  // Administrator Information
  adminFirstName: z.string().min(2, "First name must be at least 2 characters"),
  adminLastName: z.string().min(2, "Last name must be at least 2 characters"),
  adminEmail: z.string().email("Please enter a valid email address"),
  adminPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  
  // Management Details
  managementType: z.enum(["self_managed", "professional_managed"]),
  managementCompany: z.string().optional(),
  
  // Additional Information
  description: z.string().min(10, "Description must be at least 10 characters"),
  specialRequirements: z.string().optional(),
});

type StrataRegistrationData = z.infer<typeof strataRegistrationSchema>;

export default function Signup() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<StrataRegistrationData>({
    resolver: zodResolver(strataRegistrationSchema),
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
      adminPhone: "",
      managementType: "self_managed",
      managementCompany: "",
      description: "",
      specialRequirements: "",
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: StrataRegistrationData) => {
      await apiRequest("/api/strata/register", "POST", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Registration Submitted",
        description: "Your strata registration has been submitted for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error?.message || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StrataRegistrationData) => {
    registrationMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">Registration Submitted</CardTitle>
            <CardDescription>
              Your strata registration has been successfully submitted for approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Your registration will be reviewed by our team</li>
                <li>• We'll verify the strata information provided</li>
                <li>• You'll receive an email notification once approved</li>
                <li>• Access credentials will be provided upon approval</li>
              </ul>
            </div>
            <div className="text-sm text-gray-600">
              <p>Questions? Contact us at support@stratamanager.com</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">StrataManager</h1>
          </Link>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Registration Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-4">Register Your Strata</h1>
            <p className="text-lg text-muted-foreground">
              Join StrataManager and modernize your community management. All registrations require approval.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Strata Registration Form</CardTitle>
              <CardDescription>
                Please provide accurate information about your strata community. This information will be reviewed before approval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Strata Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Strata Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="strataName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strata Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Sunset Gardens Strata" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 123 Main Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Vancouver" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Province</FormLabel>
                            <FormControl>
                              <Input placeholder="BC" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="V6B 1A1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="unitCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Units</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Administrator Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Administrator Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adminFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.smith@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adminPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(604) 555-0123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Management Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Management Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="managementType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Management Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select management type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="self_managed">Self-Managed</SelectItem>
                              <SelectItem value="professional_managed">Professionally Managed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("managementType") === "professional_managed" && (
                      <FormField
                        control={form.control}
                        name="managementCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Management Company</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC Property Management" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strata Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of your strata community, building type, amenities, etc."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requirements (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requirements or notes for your strata management needs"
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registrationMutation.isPending}
                    >
                      {registrationMutation.isPending ? "Submitting..." : "Submit Registration"}
                    </Button>
                    
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> All strata registrations require approval from our administration team. 
                        You will receive an email notification once your registration has been reviewed and approved.
                      </p>
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