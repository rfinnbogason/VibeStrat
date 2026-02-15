import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useStrata } from "@/lib/strata-context";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Plus,
  Building2,
  Phone,
  Mail,
  Star,
  FileText,
  Calendar,
  DollarSign,
  History,
  Upload,
  Edit3,
  Trash2,
  Eye,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

// Form schemas
const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactInfo: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url().optional().or(z.literal(''))
  }).optional(),
  serviceCategories: z.array(z.string()).optional(),
  businessLicense: z.string().optional(),
  insurance: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    coverageAmount: z.string().optional()
  }).optional(),
  emergencyContact: z.string().optional(),
  isPreferred: z.boolean().optional(),
  notes: z.string().optional()
});

const contractSchema = z.object({
  contractName: z.string().min(1, "Contract name is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  costAmount: z.string().min(1, "Cost amount is required"),
  costFrequency: z.string().min(1, "Cost frequency is required"),
  paymentTerms: z.string().optional(),
  serviceScope: z.string().optional(),
  autoRenew: z.boolean().optional(),
  renewalTerms: z.string().optional(),
  strataId: z.string().min(1, "Strata is required")
});

const historySchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  cost: z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  strataId: z.string().min(1, "Strata is required")
});

export default function Vendors() {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [isAddHistoryOpen, setIsAddHistoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { toast } = useToast();

  // Get strata context
  const { selectedStrataId, selectedStrata, isLoading: strataLoading } = useStrata();

  // Get user and auth
  const { user } = useAuth();

  // Fetch user's role for the selected strata
  const { data: userRoleData } = useQuery<{ role: string }>({
    queryKey: [`/api/strata/${selectedStrataId}/user-role`],
    enabled: !!user && !!selectedStrataId,
  });

  // ✅ SECURITY: Check if user has permission to create vendors
  const userRole = user?.email === 'rfinnbogason@gmail.com' ? 'master_admin' : (userRoleData?.role || 'resident');
  const canCreateVendor = userRole && ['chairperson', 'property_manager', 'treasurer', 'master_admin'].includes(userRole);

  // Fetch vendors for current strata
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/vendors`],
    enabled: !!selectedStrataId
  });

  // Fetch vendor contracts for current strata
  const { data: contracts } = useQuery({
    queryKey: ["/api/strata", selectedStrataId, "vendor-contracts"],
    enabled: !!selectedStrataId
  });

  // Fetch vendor history for current strata
  const { data: history } = useQuery({
    queryKey: ["/api/strata", selectedStrataId, "vendor-history"],
    enabled: !!selectedStrataId
  });

  // Forms
  const vendorForm = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      contactInfo: {},
      serviceCategories: [],
      isPreferred: false,
      otherCategory: "",
      insurance: {},
      businessLicense: "",
      emergencyContact: "",
      notes: ""
    }
  });

  const contractForm = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractName: "",
      costFrequency: "monthly",
      autoRenew: false,
      strataId: selectedStrataId || ""
    }
  });

  const historyForm = useForm({
    resolver: zodResolver(historySchema),
    defaultValues: {
      eventType: "service_completed",
      strataId: selectedStrataId || ""
    }
  });

  // Mutations
  const createVendorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/strata/${selectedStrataId}/vendors`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/vendors`] });
      setIsAddVendorOpen(false);
      vendorForm.reset();
      toast({ title: "Vendor created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create vendor", variant: "destructive" });
    }
  });

  const createContractMutation = useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: any }) => {
      return apiRequest("POST", `/api/vendors/${vendorId}/contracts`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strata", selectedStrataId, "vendor-contracts"] });
      setIsAddContractOpen(false);
      contractForm.reset();
      toast({ title: "Contract created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create contract", variant: "destructive" });
    }
  });

  const createHistoryMutation = useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: any }) => {
      return apiRequest("POST", `/api/vendors/${vendorId}/history`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strata", selectedStrataId, "vendor-history"] });
      setIsAddHistoryOpen(false);
      historyForm.reset();
      toast({ title: "History entry created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create history entry", variant: "destructive" });
    }
  });

  const serviceCategories = [
    "Landscaping", "Plumbing", "Electrical", "HVAC", "Roofing", "Cleaning", 
    "Security", "Property Management", "Maintenance", "Snow Removal", 
    "Waste Management", "Painting", "Flooring", "Appliance Repair"
  ];

  const eventTypes = [
    { value: "service_completed", label: "Service Completed" },
    { value: "issue_reported", label: "Issue Reported" },
    { value: "contract_signed", label: "Contract Signed" },
    { value: "payment_made", label: "Payment Made" },
    { value: "note_added", label: "Note Added" }
  ];

  const costFrequencies = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annually", label: "Annually" },
    { value: "one-time", label: "One-time" }
  ];

  const filteredVendors = vendors?.filter((vendor: any) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || vendor.serviceCategories?.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Calculate vendor statistics
  const getVendorStats = (vendorId: string) => {
    const vendorContracts = contracts?.filter((c: any) => c.vendorId === vendorId) || [];
    const vendorHistory = history?.filter((h: any) => h.vendorId === vendorId) || [];
    
    const activeContracts = vendorContracts.filter((c: any) => c.status === 'active').length;
    const totalContracts = vendorContracts.length;
    const totalCost = vendorContracts.reduce((sum: number, c: any) => sum + parseFloat(c.costAmount || 0), 0);
    const avgRating = vendorHistory.length > 0 
      ? vendorHistory.reduce((sum: number, h: any) => sum + (h.rating || 0), 0) / vendorHistory.filter((h: any) => h.rating).length
      : 0;

    return { activeContracts, totalContracts, totalCost, avgRating: Math.round(avgRating * 10) / 10 };
  };

  const onSubmitVendor = (data: any) => {
    createVendorMutation.mutate(data);
  };

  const onSubmitContract = (data: any) => {
    if (!selectedVendor) return;
    
    const contractData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      costAmount: parseFloat(data.costAmount)
    };
    
    createContractMutation.mutate({ vendorId: selectedVendor, data: contractData });
  };

  const onSubmitHistory = (data: any) => {
    if (!selectedVendor) return;
    
    const historyData = {
      ...data,
      eventDate: new Date(data.eventDate).toISOString(),
      cost: data.cost ? parseFloat(data.cost) : null,
      rating: data.rating || null
    };
    
    createHistoryMutation.mutate({ vendorId: selectedVendor, data: historyData });
  };

  // Show loading while strata context is loading or no strata selected
  if (strataLoading || !selectedStrata) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (vendorsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Vendor Management</h1>
        </div>
        <div className="text-center py-12">
          <p>Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage contractors, contracts, and service history
          </p>
        </div>
        <div className="flex gap-2">
          {canCreateVendor ? (
            <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto text-sm sm:text-base">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              <Form {...vendorForm}>
                <form onSubmit={vendorForm.handleSubmit(onSubmitVendor)} className="space-y-4">
                  <FormField
                    control={vendorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Company Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={vendorForm.control}
                      name="contactInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="contact@company.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={vendorForm.control}
                      name="contactInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+1 (555) 123-4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={vendorForm.control}
                    name="contactInfo.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Street address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="contactInfo.website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://www.company.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label className="text-sm font-medium">Service Categories</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {serviceCategories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`category-${category}`}
                            checked={vendorForm.watch('serviceCategories')?.includes(category) || false}
                            onChange={(e) => {
                              const currentCategories = vendorForm.getValues('serviceCategories') || [];
                              if (e.target.checked) {
                                vendorForm.setValue('serviceCategories', [...currentCategories, category]);
                              } else {
                                vendorForm.setValue('serviceCategories', currentCategories.filter(c => c !== category));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`category-${category}`} className="text-sm">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="category-other"
                          checked={vendorForm.watch('otherCategory') ? true : false}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              vendorForm.setValue('otherCategory', '');
                              // Remove any custom category from serviceCategories
                              const currentCategories = vendorForm.getValues('serviceCategories') || [];
                              const filteredCategories = currentCategories.filter(c => serviceCategories.includes(c));
                              vendorForm.setValue('serviceCategories', filteredCategories);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="category-other" className="text-sm font-medium">
                          Other (specify below)
                        </label>
                      </div>
                      
                      {vendorForm.watch('otherCategory') !== undefined && (
                        <Input
                          placeholder="Enter custom service category"
                          value={vendorForm.watch('otherCategory') || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            vendorForm.setValue('otherCategory', value);
                            
                            // Update serviceCategories to include the custom category
                            const currentCategories = vendorForm.getValues('serviceCategories') || [];
                            const standardCategories = currentCategories.filter(c => serviceCategories.includes(c));
                            
                            if (value.trim()) {
                              vendorForm.setValue('serviceCategories', [...standardCategories, value.trim()]);
                            } else {
                              vendorForm.setValue('serviceCategories', standardCategories);
                            }
                          }}
                          className="ml-6"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={vendorForm.control}
                      name="businessLicense"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business License</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="License number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={vendorForm.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Emergency phone number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Insurance Information</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Provider</Label>
                          <Input 
                            placeholder="Insurance provider"
                            value={vendorForm.watch('insurance.provider') || ''}
                            onChange={(e) => vendorForm.setValue('insurance.provider', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Policy Number</Label>
                          <Input 
                            placeholder="Policy number"
                            value={vendorForm.watch('insurance.policyNumber') || ''}
                            onChange={(e) => vendorForm.setValue('insurance.policyNumber', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Expiry Date</Label>
                          <Input 
                            type="date"
                            value={vendorForm.watch('insurance.expiryDate') || ''}
                            onChange={(e) => vendorForm.setValue('insurance.expiryDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Coverage Amount</Label>
                          <Input 
                            placeholder="$1,000,000"
                            value={vendorForm.watch('insurance.coverageAmount') || ''}
                            onChange={(e) => vendorForm.setValue('insurance.coverageAmount', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPreferred"
                        checked={vendorForm.watch('isPreferred') || false}
                        onChange={(e) => vendorForm.setValue('isPreferred', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="isPreferred" className="text-sm">
                        Mark as Preferred Vendor
                      </Label>
                    </div>
                  </div>

                  <FormField
                    control={vendorForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Additional notes about this vendor" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddVendorOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createVendorMutation.isPending}>
                      {createVendorMutation.isPending ? "Creating..." : "Create Vendor"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-md">
              <Shield className="h-4 w-4" />
              <span>Only administrators can create vendors</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input 
            placeholder="Search vendors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {serviceCategories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredVendors?.map((vendor: any) => {
          const stats = getVendorStats(vendor.id);
          
          return (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{vendor.name}</CardTitle>
                      {vendor.isPreferred && (
                        <Badge className="bg-yellow-100 text-yellow-800">Preferred</Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {vendor.serviceCategories?.map((category: string) => (
                        <Badge key={category} variant="secondary">{category}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{vendor.contactInfo?.phone || "No phone provided"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{vendor.contactInfo?.email || "No email provided"}</span>
                        </div>
                        {vendor.contactInfo?.website && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={vendor.contactInfo.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span>{vendor.businessLicense || "License not provided"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{stats.avgRating > 0 ? `${stats.avgRating}/5 rating` : "No ratings yet"}</span>
                        </div>
                        {vendor.emergencyContact && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span>Emergency: {vendor.emergencyContact}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {vendor.insurance && (vendor.insurance.provider || vendor.insurance.expiryDate) && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-md">
                        <div className="text-xs font-medium text-blue-800 mb-1">Insurance</div>
                        <div className="text-xs text-blue-700">
                          {vendor.insurance.provider && `Provider: ${vendor.insurance.provider}`}
                          {vendor.insurance.provider && vendor.insurance.expiryDate && " • "}
                          {vendor.insurance.expiryDate && `Expires: ${new Date(vendor.insurance.expiryDate).toLocaleDateString()}`}
                        </div>
                      </div>
                    )}

                    {vendor.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-md">
                        <div className="text-xs font-medium text-gray-700 mb-1">Notes</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{vendor.notes}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">{vendor.name}</DialogTitle>
                        </DialogHeader>
                        
                        <Tabs defaultValue="overview" className="mt-4">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="contracts">
                              Contracts ({stats.activeContracts}/{stats.totalContracts})
                            </TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="p-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-5 w-5 text-blue-500" />
                                  <div>
                                    <p className="text-2xl font-bold">{stats.totalContracts}</p>
                                    <p className="text-sm text-muted-foreground">Total Contracts</p>
                                  </div>
                                </div>
                              </Card>
                              <Card className="p-4">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                  <div>
                                    <p className="text-2xl font-bold">{stats.activeContracts}</p>
                                    <p className="text-sm text-muted-foreground">Active Contracts</p>
                                  </div>
                                </div>
                              </Card>
                              <Card className="p-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-5 w-5 text-green-500" />
                                  <div>
                                    <p className="text-2xl font-bold">${stats.totalCost.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">Total Value</p>
                                  </div>
                                </div>
                              </Card>
                              <Card className="p-4">
                                <div className="flex items-center gap-2">
                                  <Star className="h-5 w-5 text-yellow-500" />
                                  <div>
                                    <p className="text-2xl font-bold">{stats.avgRating || "N/A"}</p>
                                    <p className="text-sm text-muted-foreground">Average Rating</p>
                                  </div>
                                </div>
                              </Card>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Contact Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Email:</strong> {vendor.contactInfo?.email || "Not provided"}
                                  </div>
                                  <div>
                                    <strong>Phone:</strong> {vendor.contactInfo?.phone || "Not provided"}
                                  </div>
                                  <div className="col-span-2">
                                    <strong>Address:</strong> {vendor.contactInfo?.address || "Not provided"}
                                  </div>
                                  <div>
                                    <strong>Website:</strong> {vendor.contactInfo?.website || "Not provided"}
                                  </div>
                                  <div>
                                    <strong>Emergency Contact:</strong> {vendor.emergencyContact || "Not provided"}
                                  </div>
                                </div>
                              </div>

                              {vendor.notes && (
                                <div>
                                  <h4 className="font-semibold mb-2">Notes</h4>
                                  <p className="text-sm text-muted-foreground">{vendor.notes}</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="contracts" className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold">Contracts</h4>
                              <Dialog open={isAddContractOpen} onOpenChange={setIsAddContractOpen}>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    onClick={() => setSelectedVendor(vendor.id)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Contract
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Add Contract for {vendor.name}</DialogTitle>
                                  </DialogHeader>
                                  <Form {...contractForm}>
                                    <form onSubmit={contractForm.handleSubmit(onSubmitContract)} className="space-y-4">
                                      <FormField
                                        control={contractForm.control}
                                        name="contractName"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Contract Name</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="e.g., Landscaping Services 2024" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={contractForm.control}
                                        name="description"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                              <Textarea {...field} placeholder="Brief description of services" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                          control={contractForm.control}
                                          name="startDate"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Start Date</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="date" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        <FormField
                                          control={contractForm.control}
                                          name="endDate"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>End Date (Optional)</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="date" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                          control={contractForm.control}
                                          name="costAmount"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Cost Amount</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="number" placeholder="0.00" step="0.01" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        <FormField
                                          control={contractForm.control}
                                          name="costFrequency"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Cost Frequency</FormLabel>
                                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select frequency" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  {costFrequencies.map(freq => (
                                                    <SelectItem key={freq.value} value={freq.value}>
                                                      {freq.label}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      <FormField
                                        control={contractForm.control}
                                        name="serviceScope"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Service Scope</FormLabel>
                                            <FormControl>
                                              <Textarea {...field} placeholder="Detailed scope of work" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={contractForm.control}
                                        name="paymentTerms"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Payment Terms</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="e.g., Net 30 days" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsAddContractOpen(false)}>
                                          Cancel
                                        </Button>
                                        <Button type="submit" disabled={createContractMutation.isPending}>
                                          {createContractMutation.isPending ? "Creating..." : "Create Contract"}
                                        </Button>
                                      </div>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                            </div>

                            <div className="space-y-3">
                              {contracts?.filter((c: any) => c.vendorId === vendor.id).map((contract: any) => (
                                <Card key={contract.id} className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3">
                                        <h5 className="font-semibold">{contract.contractName}</h5>
                                        <Badge className={
                                          contract.status === 'active' ? 'bg-green-100 text-green-800' :
                                          contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                        }>
                                          {contract.status}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{contract.description}</p>
                                      <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <strong>Cost:</strong> ${parseFloat(contract.costAmount).toLocaleString()} / {contract.costFrequency}
                                        </div>
                                        <div>
                                          <strong>Start:</strong> {new Date(contract.startDate).toLocaleDateString()}
                                        </div>
                                        <div>
                                          <strong>End:</strong> {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "Ongoing"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )) || (
                                <p className="text-muted-foreground text-center py-8">No contracts found</p>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="history" className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold">Service History</h4>
                              <Dialog open={isAddHistoryOpen} onOpenChange={setIsAddHistoryOpen}>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    onClick={() => setSelectedVendor(vendor.id)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Entry
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Add History Entry for {vendor.name}</DialogTitle>
                                  </DialogHeader>
                                  <Form {...historyForm}>
                                    <form onSubmit={historyForm.handleSubmit(onSubmitHistory)} className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                          control={historyForm.control}
                                          name="eventType"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Event Type</FormLabel>
                                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select event type" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  {eventTypes.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                      {type.label}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        <FormField
                                          control={historyForm.control}
                                          name="eventDate"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Event Date</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="date" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      <FormField
                                        control={historyForm.control}
                                        name="title"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Brief title for this entry" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={historyForm.control}
                                        name="description"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                              <Textarea {...field} placeholder="Detailed description of the event" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                          control={historyForm.control}
                                          name="cost"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Cost (Optional)</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="number" placeholder="0.00" step="0.01" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        <FormField
                                          control={historyForm.control}
                                          name="rating"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Rating (1-5)</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="number" min="1" max="5" placeholder="Rating" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsAddHistoryOpen(false)}>
                                          Cancel
                                        </Button>
                                        <Button type="submit" disabled={createHistoryMutation.isPending}>
                                          {createHistoryMutation.isPending ? "Creating..." : "Create Entry"}
                                        </Button>
                                      </div>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                            </div>

                            <div className="space-y-3">
                              {history?.filter((h: any) => h.vendorId === vendor.id)
                                .sort((a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
                                .map((entry: any) => (
                                <Card key={entry.id} className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3">
                                        <h5 className="font-semibold">{entry.title}</h5>
                                        <Badge variant="outline">{eventTypes.find(t => t.value === entry.eventType)?.label}</Badge>
                                        {entry.rating && (
                                          <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm">{entry.rating}/5</span>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                                      <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          {new Date(entry.eventDate).toLocaleDateString()}
                                        </div>
                                        {entry.cost && (
                                          <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            ${parseFloat(entry.cost).toLocaleString()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )) || (
                                <p className="text-muted-foreground text-center py-8">No history entries found</p>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="actions" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Button variant="outline" className="h-20 flex-col">
                                <Upload className="h-6 w-6 mb-2" />
                                Upload Contract
                              </Button>
                              <Button variant="outline" className="h-20 flex-col">
                                <Edit3 className="h-6 w-6 mb-2" />
                                Edit Details
                              </Button>
                              <Button variant="outline" className="h-20 flex-col">
                                <TrendingUp className="h-6 w-6 mb-2" />
                                View Analytics
                              </Button>
                              <Button variant="outline" className="h-20 flex-col text-red-600 hover:text-red-700">
                                <Trash2 className="h-6 w-6 mb-2" />
                                Remove Vendor
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{stats.totalContracts} Contracts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{stats.activeContracts} Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-medium">${stats.totalCost.toLocaleString()} Total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">
                      {contracts?.filter((c: any) => c.vendorId === vendor.id && c.costFrequency === 'monthly').length} Monthly
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!filteredVendors || filteredVendors.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Vendors Found</h3>
              <p className="text-muted-foreground mb-4">
                {vendors?.length === 0 
                  ? "Start by adding your first vendor to begin managing contracts and services."
                  : "No vendors match your current search criteria."
                }
              </p>
              <Button onClick={() => setIsAddVendorOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Vendor
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
