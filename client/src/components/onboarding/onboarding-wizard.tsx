import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const strataSchema = z.object({
  name: z.string().min(2, "Strata name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  province: z.string().min(2, "Province must be at least 2 characters"),
  postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  unitCount: z.number().min(1, "Unit count must be at least 1"),
  managementType: z.enum(["self_managed", "professional_managed"]),
  managementCompany: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type StrataFormData = z.infer<typeof strataSchema>;

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<StrataFormData>({
    resolver: zodResolver(strataSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      unitCount: 0,
      managementType: "self_managed",
      managementCompany: "",
      description: "",
    },
  });

  const onSubmit = async (data: StrataFormData) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a strata.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🏢 Creating strata:", data.name);

      // Get auth token
      const token = localStorage.getItem("auth_token");

      // Create the strata
      const strataResponse = await fetch('/api/strata', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          country: "Canada",
          unitCount: data.unitCount,
          managementCompany: data.managementType === "professional_managed" ? data.managementCompany : undefined,
          notes: data.description,
          status: "active",
        })
      });

      if (!strataResponse.ok) {
        const errorData = await strataResponse.json();
        throw new Error(errorData.message || "Failed to create strata");
      }

      const strataData = await strataResponse.json();
      console.log("✅ Strata created:", strataData.id);

      toast({
        title: "Success!",
        description: `Your property "${data.name}" has been created successfully.`,
      });

      // Complete onboarding
      onComplete();
    } catch (error: any) {
      console.error("❌ Error creating strata:", error);
      toast({
        title: "Failed to Create Property",
        description: error.message || "An error occurred while creating your property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Setup Skipped",
      description: "You can create a property later from the dashboard.",
    });
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-full">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Welcome to VibeStrat!</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Let's set up your first property to get started
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Property Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Property Information
                </h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sunset Gardens Strata" {...field} />
                      </FormControl>
                      <FormDescription>
                        The official name of your strata property
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
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
                        <FormLabel>City *</FormLabel>
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
                        <FormLabel>Province *</FormLabel>
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
                        <FormLabel>Postal Code *</FormLabel>
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
                      <FormLabel>Number of Units *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Total number of residential units in your property
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Management Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Management Details</h3>

                <FormField
                  control={form.control}
                  name="managementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Type *</FormLabel>
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
                      <FormDescription>
                        Is your strata self-managed by the council or managed by a professional company?
                      </FormDescription>
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
                      <FormLabel>Property Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of your strata community, building type, amenities, etc."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a brief overview of your property
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Property...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Create Property & Get Started
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                >
                  Skip for now
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  You can add more details and customize settings after setup
                </p>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
